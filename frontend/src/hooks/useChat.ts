import { useState, useCallback } from "react";
import type { Message } from "../types";
import { sendChatMessage } from "../services/chatApi";

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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      const data = await sendChatMessage(text);

      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          data.message ||
          "Xin lỗi, tôi không nhận được phản hồi hợp lệ từ server.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);

      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Lỗi: ${String(err)}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    clearMessages,
  };
}