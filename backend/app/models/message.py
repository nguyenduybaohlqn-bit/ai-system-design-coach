from sqlalchemy import Integer, String
from sqlalchemy.orm import mapped_column
from app.database import Base

class Message(Base):
    __tablename__ = "messages"
    id = mapped_column(Integer, primary_key=True, index=True)
    conversation_id = mapped_column(Integer)
    role = mapped_column(String(50))
    content = mapped_column(String(500))
    created_at = mapped_column(String(50))