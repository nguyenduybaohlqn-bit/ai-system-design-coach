import os

from google import genai
from google.genai import types
from google.genai import errors

from app.config import settings

if not settings.GEMINI_API_KEY:
    raise ValueError("LỖI: Chưa có GEMINI_API_KEY. Vui lòng kiểm tra lại file .env")

os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY

client = genai.Client()

PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-2.5-flash-lite"

SYSTEM_INSTRUCTION_TEMPLATE = (
    "Bạn là một trợ lý AI chuyên về thiết kế hệ thống. "
    "Hãy trả lời câu hỏi của người dùng dựa trên kiến thức và các tài liệu tham khảo được cung cấp.\n"
    "Reference Knowledge:\n{context}"
)

TITLE_PROMPT = (
    "Dựa trên nội dung tin nhắn sau, hãy tạo một tiêu đề ngắn gọn "
    "(tốt nhất là khoảng 5 - 6 từ, tối đa 10 từ) phù hợp để đặt tên "
    "cho cuộc trò chuyện này, không viết các kí tự đặc biệt nếu không cần thiết\n\n"
)


def build_gemini_contents(history: list) -> list:
    """Chuyển đổi lịch sử từ DB sang định dạng Gemini Content."""
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part(text=msg.content)]
            )
        )
    return contents


async def stream_generator(contents, config=None, primary_model: str = PRIMARY_MODEL,
                            fallback_model: str = FALLBACK_MODEL):
    """Gọi Gemini API theo dạng stream, tự động fallback nếu model chính bị quá tải (503)."""
    FLUSH_CHARS = {".", "!", "?", "\n"}  # flush khi gặp dấu kết câu
    BUFFER_SIZE = 80                      # hoặc flush khi buffer đủ lớn

    try:
        response_stream = client.models.generate_content_stream(
            model=primary_model,
            contents=contents,
            config=config
        )
        buffer = ""
        for chunk in response_stream:
            if chunk.text:
                buffer += chunk.text
                # Flush khi gặp dấu kết câu hoặc buffer đủ lớn
                if any(c in buffer for c in FLUSH_CHARS) or len(buffer) >= BUFFER_SIZE:
                    yield buffer
                    buffer = ""

        if buffer:  # flush phần còn lại
            yield buffer

    except errors.ServerError as e:
        if e.code == 503:
            print(f"[WARNING] Model '{primary_model}' đang quá tải (503).")
            print(f"[WARNING] Tự động chuyển sang model dự phòng: '{fallback_model}'...")
            response_stream = client.models.generate_content_stream(
                model=fallback_model,
                contents=contents,
                config=config
            )
            for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
        else:
            raise


async def collect_full_response(contents, config=None, primary_model: str = PRIMARY_MODEL,
                                 fallback_model: str = FALLBACK_MODEL) -> str:
    """Gom toàn bộ phản hồi stream thành 1 chuỗi text hoàn chỉnh (dùng khi không cần stream)."""
    chunks = []
    async for text in stream_generator(contents, config, primary_model, fallback_model):
        chunks.append(text)
    return "".join(chunks)


def chat_stream(contents: list, context: str):
    """Trả về async generator stream trả lời chat, có kèm context RAG."""
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION_TEMPLATE.format(context=context)
    )
    return stream_generator(contents=contents, config=config)


def generate_title(message: str) -> str:
    """Sinh tiêu đề ngắn gọn cho cuộc trò chuyện dựa trên tin nhắn đầu tiên."""
    config = types.GenerateContentConfig(
        system_instruction=TITLE_PROMPT,
        temperature=0.5
    )

    # Thử primary model trước, nếu quá tải thì thử model tiếp theo
    for model in [FALLBACK_MODEL, PRIMARY_MODEL]:
        try:
            print(f"[DEBUG] Gọi {model} tạo tiêu đề...")
            response = client.models.generate_content(
                model=model,
                contents=message,
                config=config
            )
            return response.text.strip()

        except errors.ServerError as e:
            if e.code == 503:
                print(f"[WARNING] {model} quá tải (503), thử model tiếp theo...")
                continue  # thử model kế tiếp trong list
            raise  # lỗi khác thì throw luôn

    # Cả 2 model đều 503 → dùng luôn tin nhắn đầu làm tiêu đề
    print("[WARNING] Tất cả model đều quá tải, dùng message làm tiêu đề.")
    return message[:50].strip()