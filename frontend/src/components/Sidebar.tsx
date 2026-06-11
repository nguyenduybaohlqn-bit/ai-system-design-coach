import React from "react";
import type { Chat } from "../types";
import {
  PlusIcon, MsgIcon, UserIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from "./Icons";
import styles from "./Sidebar.module.css";

interface Props {
  expanded: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  userName?: string;
  userPlan?: string;
}

const Sidebar: React.FC<Props> = ({
  expanded,
  onToggle,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  userName = "User",
  userPlan = "Free plan",
}) => {
  return (
    <aside
      className={styles.sidebar}
      style={{ width: expanded ? 260 : 60 }}
      aria-label="Navigation sidebar"
    >
      {/* ── Toggle ───────────────────────────────────── */}
      <div className={styles.topRow}>
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={expanded ? "Thu nhỏ sidebar" : "Mở rộng sidebar"}
          title={expanded ? "Thu nhỏ" : "Mở rộng"}
        >
          {expanded
            ? <ChevronRightIcon size={16} color="var(--icon-color)" />
            : <ChevronLeftIcon  size={16} color="var(--icon-color)" />
          }
        </button>
      </div>

      {/* ── New Chat ─────────────────────────────────── */}
      <button
        className={`${styles.newChatBtn} ${!expanded ? styles.centred : ""}`}
        onClick={onNewChat}
        title="New chat"
        aria-label="Tạo chat mới"
      >
        <span className={styles.iconWrap}>
          <PlusIcon size={18} color="#7F77DD" />
        </span>
        {expanded && <span className={styles.newChatLabel}>New chat</span>}
      </button>

      {/* ── Chat list (expanded) / Chats icon (collapsed) ─ */}
      {expanded ? (
        <div className={styles.chatList}>
          <span className={styles.sectionLabel}>Gần đây</span>

          {chats.map((c) => (
            <button
              key={c.id}
              className={`${styles.chatRow} ${activeChatId === c.id ? styles.chatRowActive : ""}`}
              onClick={() => onSelectChat(c.id)}
              title={c.title}
            >
              <span className={styles.chatTitle}>{c.title}</span>
              <span className={styles.chatTime}>{c.time}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.collapsedNav}>
          <button className={styles.iconBtn} title="Chats" aria-label="Danh sách chat">
            <MsgIcon size={18} color="var(--icon-color)" />
          </button>
        </div>
      )}

      {/* ── Account ──────────────────────────────────── */}
      <div className={styles.accountRow}>
        <button
          className={`${styles.accountBtn} ${!expanded ? styles.centred : ""}`}
          title="Tài khoản"
          aria-label="Tài khoản của bạn"
        >
          <span className={styles.avatarCircle}>
            <UserIcon size={15} color="#7F77DD" />
          </span>
          {expanded && (
            <span className={styles.accountInfo}>
              <span className={styles.accountName}>{userName}</span>
              <span className={styles.accountPlan}>{userPlan}</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
