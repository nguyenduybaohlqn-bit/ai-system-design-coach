import os
import traceback
from fastapi import HTTPException
from google import genai
from google.genai import types
from google.genai import errors  # Import thư viện lỗi của genai để bắt lỗi 503

from app.config import settings
from app.database import SessionLocal
from app.repositories import conversation_repository
from app.schemas.chat import ChatResponse

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

client = genai.Client()

def safe_generate_content(primary_model: str, fallback_model: str, contents, config=None):
    """
    Gọi model chính, nếu model chính trả về lỗi 503 quá tải thì
    tự động chuyển sang gọi model dự phòng.
    """
    try:
        print(f"[DEBUG] Đang gọi model chính: {primary_model}...")
        return client.models.generate_content(
            model=primary_model,
            contents=contents,
            config=config
        )
    except errors.ServerError as e:
        # Nếu đúng lỗi 503 (Unavailable/High demand), thực hiện fallback
        if e.code == 503:
            print(f"[WARNING] Model '{primary_model}' đang quá tải (503).")
            print(f"[WARNING] Tự động chuyển đổi sang model dự phòng: '{fallback_model}'...")
            try:
                return client.models.generate_content(
                    model=fallback_model,
                    contents=contents,
                    config=config
                )
            except Exception as fallback_err:
                print(f"[ERROR] Cả model dự phòng '{fallback_model}' cũng thất bại: {fallback_err}")
                raise fallback_err
        else:
            raise e
        
def chat(user_id: str, message: str, conversation_id: int | None = None) -> ChatResponse:
    db = SessionLocal()
    try:
        print(f"[DEBUG] user_id={user_id}, conversation_id={conversation_id}")

        if conversation_id is None:
            print("[DEBUG] Tạo conversation mới...")
            new_title = set_title_from_message(message)
            conversation = conversation_repository.create_conversation(db, user_id, title=new_title)
            conversation_id = conversation.id
            conversation_title = conversation.title
            print(f"[DEBUG] conversation_id mới = {conversation_id}")
        else:
            # Lấy tiêu đề hiện tại nếu conversation đã tồn tại
            conv = conversation_repository.get_conversation(db, conversation_id)
            conversation_title = conv.title if conv else ""

        print("[DEBUG] Lưu user message...")
        conversation_repository.save_message(db, conversation_id=conversation_id, role="user", content=message)

        print("[DEBUG] Gọi Gemini xử lý chat...")
        response = safe_generate_content(
            primary_model='gemini-2.5-flash',
            fallback_model='gemini-2.5-flash-lite',
            contents=message
        )
        
        print("[DEBUG] Lưu assistant message...")
        conversation_repository.save_message(db, conversation_id=conversation_id, role="assistant", content=response.text)

        return ChatResponse(message=response.text, conversation_id=conversation_id, conversation_title=conversation_title)

    except Exception as e:
        traceback.print_exc() 
        print(f"[ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

def set_title_from_message(message: str) -> str:
    set_title_prompt = "Dựa trên nội dung tin nhắn sau, hãy tạo một tiêu đề ngắn gọn (tối đa 10 từ) phù hợp để đặt tên cho cuộc trò chuyện này, không viết các kí tự đặc biệt nếu không cần thiết\n\n"
    
    print("[DEBUG] Gọi Gemini tạo tiêu đề cuộc trò chuyện...")
    response = safe_generate_content(
        primary_model='gemini-2.5-flash-lite',
        fallback_model='gemini-2.5-flash',
        contents=message,
        config=types.GenerateContentConfig(
            system_instruction=set_title_prompt,
            temperature=0.5
        )
    )
    return response.text.strip()