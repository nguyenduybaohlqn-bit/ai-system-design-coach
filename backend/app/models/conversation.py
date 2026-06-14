from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import mapped_column
from app.database import Base

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = mapped_column(Integer, primary_key=True, index=True)
    user_id = mapped_column(Integer, ForeignKey("users.id"))
    title = mapped_column(String(100))
    created_at = mapped_column(String(50))