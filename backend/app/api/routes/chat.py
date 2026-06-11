from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(chat_request: ChatRequest):
    return {"message": chat_request.message}