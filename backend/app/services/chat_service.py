import os
import traceback
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from google.genai import errors

from app.config import settings
from app.database import SessionLocal
from app.repositories import conversation_repository
from app.schemas.chat import ChatResponse

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

client = genai.Client()

async def stream_generator(primary_model: str, fallback_model: str, contents, config=None):
    try:
        response_stream = client.models.generate_content_stream(
            model=primary_model,
            contents=contents,
            config=config
        )
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text

    except errors.ServerError as e:
        if e.code == 503:
            print(f"[WARNING] Model '{primary_model}' đang quá tải (503).")
            print(f"[WARNING] Tự động chuyển sang model dự phòng: '{fallback_model}'...")
            response_stream = client.models.generate_content_stream(
                model=fallback_model,
                contents=contents,
                config=config
            )
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        else:
            raise


async def collect_full_response(primary_model: str, fallback_model: str, contents, config=None) -> str:
    chunks = []
    async for text in stream_generator(primary_model, fallback_model, contents, config):
        chunks.append(text)
    return "".join(chunks)


def build_gemini_contents(history: list) -> list:
    """Chuyển đổi lịch sử từ DB sang định dạng Gemini Content."""
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part(text=msg.content)]
            )
        )
    return contents


async def chat(user_id: str, message: str, conversation_id: int | None = None) -> ChatResponse:
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
            conv = conversation_repository.get_conversation(db, conversation_id)
            conversation_title = conv.title if conv else ""

        print("[DEBUG] Lưu user message...")
        conversation_repository.save_message(db, conversation_id=conversation_id, role="user", content=message)

        history = conversation_repository.get_messages(db, conversation_id)
        contents = build_gemini_contents(history)

        print("[DEBUG] Gọi Gemini xử lý chat...")

        full_response = await collect_full_response(
            primary_model='gemini-2.5-flash',
            fallback_model='gemini-2.5-flash-lite',
            contents=contents
        )

        print("[DEBUG] Lưu assistant message...")
        conversation_repository.save_message(
            db,
            conversation_id=conversation_id,
            role="assistant",
            content=full_response
        )

        return ChatResponse(
            message=full_response,
            conversation_id=conversation_id,
            conversation_title=conversation_title
        )

    except Exception as e:
        traceback.print_exc()
        print(f"[ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

async def chat_stream(user_id: str, message: str, conversation_id: int | None = None) -> StreamingResponse:
    db = SessionLocal()
    try:
        if conversation_id is None:
            new_title = set_title_from_message(message)
            conversation = conversation_repository.create_conversation(db, user_id, title=new_title)
            conversation_id = conversation.id
        
        conversation_repository.save_message(db, conversation_id=conversation_id, role="user", content=message)
        history = conversation_repository.get_messages(db, conversation_id)
        contents = build_gemini_contents(history)

        async def streaming_with_save():
            try :
                chunks = []
                async for text in stream_generator(
                    primary_model='gemini-2.5-flash',
                    fallback_model='gemini-2.5-flash-lite',
                    contents=contents
                ):
                    chunks.append(text)
                    yield text

            # Lưu sau khi stream xong
                full_text = "".join(chunks)
                conversation_repository.save_message(
                    db,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_text
                )
            finally:
                db.close()

        return StreamingResponse(streaming_with_save(), media_type="text/event-stream")

    except Exception as e:
        db.close()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def set_title_from_message(message: str) -> str:
    set_title_prompt = (
        "Dựa trên nội dung tin nhắn sau, hãy tạo một tiêu đề ngắn gọn "
        "(tốt nhất là khoảng 5 - 6 từ, tối đa 10 từ) phù hợp để đặt tên "
        "cho cuộc trò chuyện này, không viết các kí tự đặc biệt nếu không cần thiết\n\n"
    )

    print("[DEBUG] Gọi Gemini tạo tiêu đề cuộc trò chuyện...")
    response = client.models.generate_content(
        model='gemini-2.5-flash-lite',
        contents=message,
        config=types.GenerateContentConfig(
            system_instruction=set_title_prompt,
            temperature=0.5
        )
    )
    return response.text.strip()