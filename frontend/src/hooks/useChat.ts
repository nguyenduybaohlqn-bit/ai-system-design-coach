import { useState, useCallback } from "react";
import type { Message } from "../types";

const BACKEND_URL = "http://127.0.0.1:8000/api/chat";

interface UseChatReturn {
  messages: Message[];
  input: string;
  loading: boolean;
  setInput: (v: string) => void;
  sendMessage: () => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message || "Xin lỗi, tôi không nhận được phản hồi hợp lệ từ server.",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
  console.error("Lỗi fetch:", err); // Xem trong Console
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      role: "assistant",
      content: `Lỗi: ${err}`, // Hiện lỗi thật lên màn hình
      timestamp: new Date(),
    },
  ]);
} finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, input, loading, setInput, sendMessage, clearMessages };
}