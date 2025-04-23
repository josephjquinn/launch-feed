import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/foundry";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (!code || !state) {
          throw new Error("Missing code or state in callback URL");
        }

        // Complete the OAuth flow
        await auth.signIn();

        // Redirect to home page after successful authentication
        navigate("/");
      } catch (error) {
        console.error("Authentication error:", error);
        // Redirect to home page with error state
        navigate("/", { state: { error: "Authentication failed" } });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-muted-foreground">
          Please wait while we complete the authentication process.
        </p>
      </div>
    </div>
  );
}
