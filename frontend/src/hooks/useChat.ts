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
  loadMessages: (msgs: Message[]) => void;  // ← thêm
}

export function useChat(
  conversationId: number | null,                                          // ← thêm
  onConversationCreated: (id: number, firstMessage: string) => void,     // ← thêm
): UseChatReturn {
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
      const data = await sendChatMessage(text, conversationId);  // ← đổi tên

      if (!conversationId && data.conversation_id) {             // ← đổi tên
        // Use server-provided conversation title if available, otherwise fall back to user's message
        onConversationCreated(data.conversation_id, data.conversation_title || text);
      }

      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message || "Xin lỗi, tôi không nhận được phản hồi hợp lệ từ server.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Lỗi: ${String(err)}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, conversationId, onConversationCreated]);  // ← thêm 2 deps

  const clearMessages = useCallback(() => setMessages([]), []);

  const loadMessages = useCallback((msgs: Message[]) => setMessages(msgs), []);

  return { messages, input, loading, setInput, sendMessage, clearMessages, loadMessages };  // ← thêm loadMessages
}