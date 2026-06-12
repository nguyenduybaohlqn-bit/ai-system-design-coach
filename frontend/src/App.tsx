import AuthPage from "./pages/AuthPage";
import ChatLayout from "./pages/ChatLayout"; 
import { useAuth } from "./hooks/useAuth";

function App() {
  const { loading, error, isAuthenticated, signIn, signUp } = useAuth();

  if (!isAuthenticated) {
    return (
      <AuthPage
        loading={loading}
        error={error}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    );
  }

  return <ChatLayout />;
}

export default App;