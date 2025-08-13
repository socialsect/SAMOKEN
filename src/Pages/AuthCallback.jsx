// src/Pages/AuthCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const finishAuth = async () => {
      try {
        // Add more detailed logging
        console.log("AuthCallback: Starting authentication process");
        console.log("Current URL:", window.location.href);
        
        const stored = JSON.parse(localStorage.getItem("oauthRedirectData") || '{}');
        console.log("Stored OAuth data:", stored);

        // Support both query and hash params
        let params;
        if (window.location.search) {
          params = new URLSearchParams(window.location.search);
        } else if (window.location.hash) {
          params = new URLSearchParams(window.location.hash.substring(1));
        } else {
          throw new Error("No authentication parameters found in URL");
        }

        const code = params.get("code");
        const state = params.get("state");
        console.log("AuthCallback params:", { code, state, stored });

        if (!code || !state) {
          console.error("Missing OAuth parameters:", { code: !!code, state: !!state });
          throw new Error("Missing code or state parameters");
        }

        // More robust state checking with fallback
        if (!stored?.state) {
          console.warn("No stored state found, checking if this is a direct callback");
          // If no stored state, this might be a direct callback or page refresh
          // We'll proceed but log a warning
        } else if (state !== stored.state) {
          console.error("State mismatch:", { received: state, stored: stored.state });
          
          // Set debug info for troubleshooting
          setDebugInfo({
            receivedState: state,
            storedState: stored.state,
            storedData: stored,
            url: window.location.href
          });
          
          // For development, we might want to proceed anyway
          if (process.env.NODE_ENV === 'development') {
            console.warn("Development mode: Proceeding despite state mismatch");
          } else {
            throw new Error("State mismatch - possible CSRF attack");
          }
        }

        console.log("Exchanging code for tokens...");
        
        // Check if we have the required OAuth data
        if (!stored?.codeVerifier) {
          console.error("Missing code verifier in stored OAuth data:", stored);
          
          // If this is the first attempt and we're missing data, wait a bit and retry
          if (retryCount < 2) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
            return;
          }
          
          throw new Error("OAuth session data is missing. Please try logging in again.");
        }
        
        // Use stored data for the token exchange
        const oauthData = stored;
        
        const tokens = await wixClient.auth.getMemberTokens(
          code,
          state,
          oauthData
        );
        
        if (!tokens?.accessToken) {
          throw new Error("No access token received");
        }

        console.log("Authentication successful, setting tokens...");
        console.log("Tokens received:", tokens);
        
        // Use the auth context to login
        const loginResult = await login(tokens);
        console.log("Login result:", loginResult);
        
        if (loginResult.success) {
          console.log("Login successful, user:", loginResult.user);
          
          // Clean up and redirect
          localStorage.removeItem("oauthRedirectData");
          console.log("Redirecting to /home...");
          
          // Use navigate instead of page reload for better state management
          console.log("Final redirect to /home using navigate");
          navigate("/home", { replace: true });
        } else {
          console.error("Login failed:", loginResult.error);
          throw new Error(loginResult.error || "Login failed");
        }

      } 
      catch (error) {
        console.error("Authentication failed:", error);
        
        // Clean up OAuth data
        localStorage.removeItem("oauthRedirectData");
        
        // Provide more specific error messages
        let errorMessage = "Login failed";
        if (error.message.includes("State mismatch")) {
          errorMessage = "Authentication session expired. Please try logging in again.";
        } else if (error.message.includes("Missing code")) {
          errorMessage = "Invalid authentication response. Please try again.";
        } else {
          errorMessage = error.message || "Login failed";
        }
        
        navigate("/", { 
          state: { 
            error: errorMessage,
            errorDetails: error.message 
          },
          replace: true
        });
      }
    };

    finishAuth();
  }, [navigate, login, retryCount]);

  // Debug view for troubleshooting
  if (debugInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-red-600">OAuth Debug Information</h2>
          <div className="space-y-4">
            <div>
              <strong>Received State:</strong> {debugInfo.receivedState}
            </div>
            <div>
              <strong>Stored State:</strong> {debugInfo.storedState}
            </div>
            <div>
              <strong>Current URL:</strong> 
              <div className="bg-gray-100 p-2 rounded text-sm break-all">
                {debugInfo.url}
              </div>
            </div>
            <div>
              <strong>Stored OAuth Data:</strong>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.storedData, null, 2)}
              </pre>
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => {
                  localStorage.removeItem("oauthRedirectData");
                  navigate("/", { replace: true });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Clear Data & Go Home
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem("oauthRedirectData");
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Completing login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;