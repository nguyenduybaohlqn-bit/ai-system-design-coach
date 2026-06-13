import { useCallback, useState } from "react";
import { sendSignInRequest, sendSignUpRequest } from "../services/authApi";

interface SignInData {
    email: string;
    password: string;
}

interface SignUpData {
    username: string;
    email: string;
    password: string;
}

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
}

export function useAuth(): UseAuthReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(
      () => !!localStorage.getItem("accessToken")
    );

    const signIn = useCallback(async (data: SignInData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sendSignInRequest(data);
            localStorage.setItem("accessToken", response.token);
            setIsAuthenticated(true);
        } catch (err) {
            setError("Đăng nhập thất bại: Email hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    }, []);

    const signUp = useCallback(async (data: SignUpData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sendSignUpRequest(data);
            localStorage.setItem("accessToken", response.token);
            setIsAuthenticated(true);
        } catch (err) {
            setError("Đăng ký thất bại: Email có thể đã được sử dụng hoặc dữ liệu không hợp lệ.");
        } finally {
            setLoading(false);
        }
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
    }, []);

    return { loading, error, isAuthenticated, signIn, signUp, signOut };
}