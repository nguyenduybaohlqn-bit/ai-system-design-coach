from fastapi import APIRouter
from pydantic import BaseModel
from app.services import chat_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(chat_request: ChatRequest):
    return chat_service.chat(chat_request.message)  # pass the string, not the object