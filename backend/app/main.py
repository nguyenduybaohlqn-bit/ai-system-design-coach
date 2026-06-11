from fastapi import FastAPI
from api.routes import chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

