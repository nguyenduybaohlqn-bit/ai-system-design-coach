import React from "react";
import type { Message } from "../types";
import { BotIcon, UserIcon } from "./Icons";
import styles from "./MessageBubble.module.css";

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`${styles.wrap} ${isUser ? styles.user : styles.ai}`}>
      {/* Avatar */}
      <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAi}`}>
        {isUser
          ? <UserIcon size={14} color="#7F77DD" />
          : <BotIcon  size={14} color="#0F6E56" />
        }
      </div>

      {/* Bubble */}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
