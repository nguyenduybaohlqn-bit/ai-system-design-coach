from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.api.routes import chat
from app.api.routes import auth
import app.models

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["System"])
async def read_root():
    return {"status": "healthy", "message": "Welcome to AI Coach !"}

app.include_router(chat.router,prefix="/api",tags =["Chat"])
app.include_router(auth.router,prefix="/api",tags =["Authentication"])

