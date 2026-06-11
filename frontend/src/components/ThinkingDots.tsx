import React from "react";
import { BotIcon } from "./Icons";
import styles from "./ThinkingDots.module.css";

const ThinkingDots: React.FC = () => (
  <div className={styles.wrap}>
    <div className={styles.avatar}>
      <BotIcon size={14} color="#0F6E56" />
    </div>
    <div className={styles.dots}>
      <span className={styles.dot} style={{ animationDelay: "0s" }} />
      <span className={styles.dot} style={{ animationDelay: "0.2s" }} />
      <span className={styles.dot} style={{ animationDelay: "0.4s" }} />
    </div>
  </div>
);

export default ThinkingDots;
