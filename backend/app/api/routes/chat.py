from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import chat_service
from app.schemas.chat import ChatRequest
from app.database import SessionLocal
from app.repositories import conversation_repository

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/chat")
def chat(chat_request: ChatRequest):
    return chat_service.chat(
        chat_request.user_id,
        chat_request.message,
        chat_request.conversation_id
    )

@router.get("/conversations")
def get_conversations(user_id: str, db: Session = Depends(get_db)):
    convs = conversation_repository.get_conversations_by_user(db, user_id)
    return [
        {"id": c.id, "title": c.title, "updated_at": c.updated_at.isoformat()}
        for c in convs
    ]

@router.get("/conversations/{conversation_id}/messages")
def get_messages(conversation_id: int, db: Session = Depends(get_db)):
    msgs = conversation_repository.get_messages(db, conversation_id)
    return [
        {"id": str(m.id), "role": m.role, "content": m.content, "timestamp": m.created_at.isoformat()}
        for m in msgs
    ]