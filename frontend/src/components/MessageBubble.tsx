import React from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "../types";
import { BotIcon, UserIcon } from "./Icons";
import styles from "./MessageBubble.module.css";

interface Props {
  message: Message;
}

const TypingIndicator: React.FC = () => (
  <div className={styles.typingIndicator}>
    <span /><span /><span />
  </div>
);

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser   = message.role === "user";
  const isLoading = !isUser && message.content === "";

  return (
    <div className={`${styles.wrap} ${isUser ? styles.user : styles.ai}`}>
      <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAi}`}>
        {isUser
          ? <UserIcon size={14} color="#7F77DD" />
          : <BotIcon  size={14} color="#0F6E56" />
        }
      </div>

      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
        {isLoading ? (
          <TypingIndicator />
        ) : isUser ? (
          // ✅ Tin nhắn user: render text thường, không cần markdown
          <span>{message.content}</span>
        ) : (
          // ✅ Tin nhắn AI: render markdown
          <div className={styles.markdown}>
              <ReactMarkdown>
                  {message.content}
              </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;