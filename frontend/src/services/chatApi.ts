import { getCurrentUser } from "../hooks/useAuth";

const BASE = "http://127.0.0.1:8000/api";

export interface ChatResponse {
  message: string;
  conversation_id: number;
  conversation_title?: string;
}


export interface ConversationSummary {
  id: number;
  title: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export async function sendChatMessage(
  message: string,
  conversationId: number | null
): Promise<ChatResponse> {
  const user = getCurrentUser();
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, conversation_id: conversationId, message }),
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function getUserConversations(): Promise<ConversationSummary[]> {
  const user = getCurrentUser();
  const res = await fetch(`${BASE}/conversations?user_id=${user.id}`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}

export async function getConversationMessages(conversationId: number): Promise<MessageRecord[]> {
  const res = await fetch(`${BASE}/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  return res.json();
}