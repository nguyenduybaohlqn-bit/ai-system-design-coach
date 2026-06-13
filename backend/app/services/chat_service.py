import os
from fastapi import HTTPException
from google import genai
from app.config import settings

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

# Khởi tạo Client TRỐNG (Không truyền tham số api_key vào đây để tránh bị check định dạng)
client = genai.Client()

def chat(message: str) -> dict:
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=message,
        )
        return {"message": response.text}
        
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))