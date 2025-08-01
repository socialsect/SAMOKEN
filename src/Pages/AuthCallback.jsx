// src/Pages/AuthCallback.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isProcessing = useRef(false);

  useEffect(() => {
    const finishAuth = async () => {
      if (isProcessing.current) {
        console.log("Already processing AuthCallback, skipping...");
        return;
      }
      isProcessing.current = true;

      try {
        const stored = JSON.parse(localStorage.getItem("oauthRedirectData") || '{}');
        console.log("Stored OAuth data:", stored);

        const params = new URLSearchParams(
          window.location.search || window.location.hash.substring(1)
        );
        const code = params.get("code");
        const state = params.get("state");
        console.log("AuthCallback params:", { code, state, stored });

        if (!code || !state) {
          throw new Error("Missing required authentication parameters");
        }

        if (state !== stored?.state) {
          throw new Error("State mismatch - possible CSRF attack");
        }

        console.log("Exchanging code for tokens...");

        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const redirectUri = isLocalhost 
          ? 'http://localhost:5173/auth/callback' 
          : 'https://runner-orpin.vercel.app/auth/callback';
        console.log("Using redirectUri:", redirectUri);

        // const tokens = await wixClient.auth.getMemberTokens(code, state, {
        //   ...stored,
        //   redirectUri,
        // });
        // console.log("Tokens received:", tokens);

        if (!tokens?.accessToken) {
          throw new Error("No access token received");
        }

        console.log("Updating auth context...");
        await login(tokens);

        localStorage.removeItem("oauthRedirectData");
        console.log("Authentication successful, redirecting to: /home");
        navigate("/home", { replace: true });
        
      } catch (error) {
        console.error("Authentication failed:", error);
        if (error.message.includes("Failed to fetch tokens")) {
          console.error("Token exchange error details:", error);
        }
        localStorage.removeItem("oauthRedirectData");
        navigate("/home", { 
          state: { 
            error: "Login failed",
            errorDetails: error.message 
          },
          replace: true
        });
      } finally {
        isProcessing.current = false;
      }
    };

    finishAuth();
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-800">Completing Login</h2>
        <p className="text-gray-600 mt-2">Please wait while we authenticate your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;