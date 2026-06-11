import React, { useState } from "react";
import type { Chat } from "./types";
import { useChat } from "./hooks/useChat";
import ChatArea from "./components/ChatArea";
import Sidebar  from "./components/Sidebar";
import "./App.css";

/* ── Mock recent chats (replace with real persistence later) ── */
const INITIAL_CHATS: Chat[] = [
  { id:"c6", title:"Multivariable calculus chain rule",  preview:"", time:"2 tuần trước", messages:[] },
];

const App: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeChatId,    setActiveChatId]    = useState("c1");
  const [chats]                               = useState<Chat[]>(INITIAL_CHATS);

  const { messages, input, loading, setInput, sendMessage, clearMessages } = useChat();

  const handleNewChat = () => {
    clearMessages();
    setActiveChatId("");
  };

  return (
    <div className="app-root">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((e) => !e)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        userName="You"
        userPlan="Free plan"
      />
      <ChatArea
        messages={messages}
        input={input}
        loading={loading}
        onInputChange={setInput}
        onSend={sendMessage}
      />
    
    </div>
  );
};

export default App;
