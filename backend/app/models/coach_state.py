from sqlalchemy import ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import mapped_column
from app.database import Base

class CoachState(Base):
    __tablename__ = "coach_states"
    conversation_id = mapped_column(Integer, ForeignKey("conversations.id"))
    