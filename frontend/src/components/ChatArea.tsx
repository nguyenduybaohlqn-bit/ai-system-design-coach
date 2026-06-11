import React, { useRef, useEffect, KeyboardEvent } from "react";
import type { Message } from "../types";
import MessageBubble from "./MessageBubble";
import ThinkingDots from "./ThinkingDots";
import { SparkleIcon, SendIcon } from "./Icons";
import styles from "./ChatArea.module.css";

interface Props {
  messages: Message[];
  input: string;
  loading: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
}

/* ── Empty state ─────────────────────────────────── */
const EmptyState: React.FC = () => (
  <div className={styles.empty}>
    <div className={styles.emptyIcon}>
      <SparkleIcon size={28} color="#7F77DD" />
    </div>
    <div className={styles.emptyText}>
      <h2>Xin chào! Tôi có thể giúp gì cho bạn?</h2>
      <p>Hãy bắt đầu một cuộc trò chuyện với AI system design coach</p>
    </div>
  </div>
);

/* ── Main component ──────────────────────────────── */
const ChatArea: React.FC<Props> = ({
  messages,
  input,
  loading,
  onInputChange,
  onSend,
}) => {
  const endRef      = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend     = input.trim().length > 0 && !loading;

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* Handle Enter (send) vs Shift+Enter (newline) */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  /* Auto-resize textarea */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
    }
  };

  /* Reset textarea height after send */
  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input]);

  return (
    <div className={styles.wrap}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <SparkleIcon size={16} color="#7F77DD" />
        </div>
        <span className={styles.headerTitle}>AI system design coach</span>
        <span className={styles.modelBadge}>ver 1.0</span>
      </header>

      {/* ── Messages ── */}
      <div className={`${styles.messages} custom-scroll`}>
        {messages.length === 0
          ? <EmptyState />
          : messages.map((m) => <MessageBubble key={m.id} message={m} />)
        }
        {loading && <ThinkingDots />}
        <div ref={endRef} />
      </div>

      {/* ── Input ── */}
      <div className={styles.inputWrap}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            placeholder="Nhắn tin với AI system design coach…"
            className={styles.textarea}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            aria-label="Nhập tin nhắn"
          />
          <button
            className={styles.sendBtn}
            onClick={onSend}
            disabled={!canSend}
            aria-label="Gửi tin nhắn"
            title="Gửi (Enter)"
          >
            <SendIcon size={15} color={canSend ? "#fff" : "#aaa"} />
          </button>
        </div>
        <p className={styles.disclaimer}>
          AI coach có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
