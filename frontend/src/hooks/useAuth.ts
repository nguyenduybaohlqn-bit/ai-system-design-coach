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
}

export function useAuth(): UseAuthReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("accessToken")
  );
    const SignIn =  useCallback(async (data: SignInData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sendSignInRequest(data);
            localStorage.setItem("accessToken", response.token);
            setIsAuthenticated(true);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }, []);
    const SignUp =  useCallback(async (data: SignUpData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await sendSignUpRequest(data);
            localStorage.setItem("accessToken", response.token);
            setIsAuthenticated(true);
        } catch (err) {
            setError(String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, isAuthenticated, signIn: SignIn, signUp: SignUp };  
}