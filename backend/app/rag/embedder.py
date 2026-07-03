import time
import os
from google import genai
from app.config import settings

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

client = genai.Client()

def embed_single(chunk: str, retries: int = 5) -> list[float]:
    for attempt in range(retries):
        try:
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=chunk
            )
            return response.embeddings[0].values

        except Exception as e:
            error_str = str(e)

            if "429" in error_str:
                wait = 65
                print(f"Rate limit (429)! Chờ {wait}s... (lần {attempt + 1}/{retries})")
                time.sleep(wait)

            elif "503" in error_str:
                wait = 10 * (attempt + 1)  # 10s, 20s, 30s... (tăng dần)
                print(f"Server lỗi (503)! Chờ {wait}s... (lần {attempt + 1}/{retries})")
                time.sleep(wait)

            else:
                raise e

    raise Exception(f"Thất bại sau {retries} lần thử")


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    print(f"Đang tạo embeddings cho {len(chunks)} chunks...")
    embeddings = []

    for i, chunk in enumerate(chunks):
        if i > 0 and i % 98 == 0:
            print(f"Đã xử lý {i}/{len(chunks)} chunks, chờ 63s để tránh rate limit...")
            time.sleep(63)
            print("Tiếp tục embedding chunk...")
        embedding = embed_single(chunk)
        embeddings.append(embedding)

    print(f"Đã tạo embeddings cho {len(chunks)} chunks.")
    return embeddings