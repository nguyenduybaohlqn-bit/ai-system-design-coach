import React, { useEffect, useCallback, useState } from "react";  // ← thêm React
import type { Chat, Message } from "../types/index";                     // ← gộp import
import type { MessageRecord } from "../services/chatApi";
import { getUserConversations, getConversationMessages } from "../services/chatApi";
import { useChat } from "../hooks/useChat";                        // ← thêm
import Sidebar from "../components/Sidebar";                       // ← thêm
import ChatArea from "../components/ChatArea";                     // ← thêm
import "./ChatLayout.css";                         // ← thêm

interface ChatLayoutProps {   // ← thêm, không thể thiếu
  onSignOut: () => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ onSignOut }) => {
  const [sidebarExpanded,       setSidebarExpanded]      = useState(true);
  const [activeConversationId,  setActiveConversationId] = useState<number | null>(null);
  const [chats,                 setChats]                = useState<Chat[]>([]);
  const [historyLoading,        setHistoryLoading]       = useState(false);

  const handleConversationCreated = useCallback((id: number, firstMessage: string) => {
    setActiveConversationId(id);
    setChats((prev) => [
      {
        id: String(id),
        title: firstMessage.length > 40 ? firstMessage.slice(0, 40) + "…" : firstMessage,  // ← dùng firstMessage
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  }, []);

  const { messages, input, loading, setInput, sendMessage, clearMessages, loadMessages } =
    useChat(activeConversationId, handleConversationCreated);

  useEffect(() => {
    getUserConversations()
      .then((list) =>
        setChats(
          list.map((c) => ({
            id: String(c.id),
            title: c.title,
            time: new Date(c.updated_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        )
      )
      .catch(console.error);
  }, []);

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      const id = parseInt(chatId, 10);
      if (id === activeConversationId) return;

      clearMessages();
      setActiveConversationId(id);
      setHistoryLoading(true);

      try {
        const records = await getConversationMessages(id);
        const msgs: Message[] = records.map((r: MessageRecord) => ({
          id: r.id,
          role: r.role,
          content: r.content,
          timestamp: new Date(r.timestamp),
        }));
        loadMessages(msgs);
      } catch (err) {
        console.error("Không tải được lịch sử:", err);
      } finally {
        setHistoryLoading(false);
      }
    },
    [activeConversationId, clearMessages, loadMessages]
  );

  const handleNewChat = useCallback(() => {   // ← thêm useCallback
    clearMessages();
    setActiveConversationId(null);
  }, [clearMessages]);

  return (
    <div className="app-root">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((e) => !e)}
        chats={chats}
        activeChatId={activeConversationId ? String(activeConversationId) : ""}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onSignOut={onSignOut}
        userName="You"
        userPlan="Free plan"
      />
      <ChatArea
        messages={messages}
        input={input}
        loading={loading || historyLoading}
        onInputChange={setInput}
        onSend={sendMessage}
      />
    </div>
  );
};

export default ChatLayout;