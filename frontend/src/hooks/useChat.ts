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
  loadMessages: (msgs: Message[]) => void;
}

export function useChat(
  conversationId: number | null,
  onConversationCreated: (id: number, title: string) => void,
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

    const assistantId = Date.now().toString() + "_assistant";
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    const queue: string[] = [];
    let done = false;

    const interval = setInterval(() => {
      if (queue.length > 0) {
        // Lấy 1 chunk từ queue, append vào UI
        const next = queue.shift()!;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + next }
              : msg
          )
        );
      } else if (done) {
        // Queue rỗng và stream đã xong → dừng interval
        clearInterval(interval);
      }
    }, 18);

    await sendChatMessage(
      text,
      conversationId,
      (chunk) => {
        const chars = chunk.split("");
        for (const char of chars) {
            queue.push(char);
        }
      },
      (newId, newTitle) => {
        done = true;
        if (!conversationId && newId) {
          onConversationCreated(newId, newTitle || text);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: `Lỗi: ${err.message}` }
              : msg
          )
        );
        setLoading(false);
      }
    );
  }, [input, loading, conversationId, onConversationCreated]);

  const clearMessages = useCallback(() => setMessages([]), []);
  const loadMessages  = useCallback((msgs: Message[]) => setMessages(msgs), []);

  return { messages, input, loading, setInput, sendMessage, clearMessages, loadMessages };
}