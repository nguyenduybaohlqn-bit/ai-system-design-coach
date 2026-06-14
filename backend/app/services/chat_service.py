import datetime
import os
from fastapi import HTTPException
from google import genai
from app.config import settings
from app.database import SessionLocal
from app.repositories import conversation_repository
from app.schemas.chat import ChatResponse

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

# Khởi tạo Client TRỐNG (Không truyền tham số api_key vào đây để tránh bị check định dạng)
client = genai.Client()

def chat(user_id: str, message: str, conversation_id: int | None = None) -> ChatResponse:
    db = SessionLocal()
    try:
        print(f"[DEBUG] user_id={user_id}, conversation_id={conversation_id}")

        if conversation_id is None:
            print("[DEBUG] Tạo conversation mới...")
            conversation = conversation_repository.create_conversation(db, user_id, title="Cuộc trò chuyện mới")
            conversation_id = conversation.id
            print(f"[DEBUG] conversation_id mới = {conversation_id}")

        print("[DEBUG] Lưu user message...")
        conversation_repository.save_message(db, conversation_id=conversation_id, role="user", content=message)

        print("[DEBUG] Gọi Gemini...")
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=message,
        )
        print(f"[DEBUG] Gemini response = {response.text[:50]}")

        print("[DEBUG] Lưu assistant message...")
        conversation_repository.save_message(db, conversation_id=conversation_id, role="assistant", content=response.text)

        return ChatResponse(message=response.text, conversation_id=conversation_id)

    except Exception as e:
        import traceback
        traceback.print_exc()   # ← in full traceback
        print(f"[ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()