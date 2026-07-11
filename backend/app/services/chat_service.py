import traceback
from urllib.parse import quote

from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.database import SessionLocal
from app.repositories import conversation_repository
from app.rag.retriever import retrieve
import app.llm.llm_service


async def chat(user_id: str, message: str, conversation_id: int | None = None) -> StreamingResponse:
    """Nhận request chat từ người dùng, điều phối lưu trữ và ủy quyền việc gọi LLM cho llm_service."""
    db = SessionLocal()
    try:
        print(f"[DEBUG] user_id={user_id}, conversation_id={conversation_id}")

        if conversation_id is None:
            print("[DEBUG] Tạo conversation mới...")
            new_title = app.llm.llm_service.generate_title(message)
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
        context = retrieve(message, top_k=5)
        contents = app.llm.llm_service.build_gemini_contents(history)

        async def streaming_with_save():
            try:
                chunks = []
                async for text in app.llm.llm_service.chat_stream(contents=contents, context=context):
                    chunks.append(text)
                    yield text

                full_text = "".join(chunks)
                conversation_repository.save_message(
                    db,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_text
                )
            finally:
                db.close()

        response = StreamingResponse(streaming_with_save(), media_type="text/plain")
        response.headers["X-Conversation-Id"] = str(conversation_id)
        response.headers["X-Conversation-Title"] = quote(conversation_title or "")
        response.headers["Access-Control-Expose-Headers"] = "X-Conversation-Id, X-Conversation-Title"
        return response

    except Exception as e:
        db.close()
        traceback.print_exc()
        print(f"[ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))