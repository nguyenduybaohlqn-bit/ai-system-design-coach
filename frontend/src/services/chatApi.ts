const BACKEND_URL = "http://127.0.0.1:8000/api/chat";

export interface ChatResponse {
  message: string;
}

export async function sendChatMessage(
  message: string
): Promise<ChatResponse> {
  const res = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`);
  }

  return await res.json();
}