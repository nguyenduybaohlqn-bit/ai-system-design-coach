import { useState } from "react";
import styles from "./AuthPage.module.css";

/**
 * AuthPage
 *
 * UI-only sign in / sign up screen. Wire it up to your own auth hook
 * via the props below:
 *
 *  - onSignIn({ email, password, remember })
 *  - onSignUp({ name, email, password })
 *  - onGoogleAuth() / onGithubAuth()  (optional)
 *  - loading: boolean
 *  - error: string | null
 */

// 1. Định nghĩa khuôn mẫu (Type) cho các hàm callback nhận vào từ App cha
interface AuthPageProps {
  onSignIn?: (data: { email: string; password: string; remember: boolean }) => void;
  onSignUp?: (data: { name: string; email: string; password: string }) => void;
  onGoogleAuth?: () => void;
  onGithubAuth?: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function AuthPage({
  onSignIn,
  onSignUp,
  loading = false,
  error = null,
}: AuthPageProps) { // 2. Ép kiểu AuthPageProps tại đây
  const [mode, setMode] = useState<"signin" | "signup">("signin"); // Định rõ text mang giá trị cố định
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const isSignUp = mode === "signup";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // Thêm kiểu cho sự kiện Form
    e.preventDefault();
    if (isSignUp) {
      onSignUp?.({ name, email, password });
    } else {
      onSignIn?.({ email, password, remember });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLogo}>
            <i className="ti ti-sparkles" aria-hidden="true" />
          </div>
          <h1 className={styles.headerTitle}>
            {isSignUp ? "Tạo tài khoản" : "Chào mừng trở lại"}
          </h1>
          <p className={styles.headerSubtitle}>
            {isSignUp
              ? "Đăng ký để bắt đầu sử dụng"
              : "Đăng nhập để tiếp tục"}
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${!isSignUp ? styles.tabActive : ""}`}
            onClick={() => setMode("signin")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`${styles.tab} ${isSignUp ? styles.tabActive : ""}`}
            onClick={() => setMode("signup")}
          >
            Đăng ký
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {isSignUp && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">
                Username
              </label>
              <div className={styles.inputBox}>
                <span className={styles.inputIcon}>
                  <i className="ti ti-user" aria-hidden="true" />
                </span>
                <input
                  id="name"
                  className={styles.input}
                  type="text"
                  placeholder="User123"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <div className={styles.inputBox}>
              <span className={styles.inputIcon}>
                <i className="ti ti-mail" aria-hidden="true" />
              </span>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="ban@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Mật khẩu
            </label>
            <div className={styles.inputBox}>
              <span className={styles.inputIcon}>
                <i className="ti ti-lock" aria-hidden="true" />
              </span>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <i className={`ti ti-${showPassword ? "eye-off" : "eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className={styles.row}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>
              <button type="button" className={styles.link}>
                Quên mật khẩu?
              </button>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : isSignUp
              ? "Tạo tài khoản"
              : "Đăng nhập"}
          </button>
        </form>

        <p className={styles.footerNote}>
          {isSignUp ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button
            type="button"
            className={styles.link}
            onClick={() => setMode(isSignUp ? "signin" : "signup")}
          >
            {isSignUp ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </p>

        <p className={styles.disclaimer}>
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.
        </p>
      </div>
    </div>
  );
}
