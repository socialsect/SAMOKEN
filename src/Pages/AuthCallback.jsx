// src/Pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishAuth = async () => {
      try {
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
          throw new Error("Missing code or state parameters");
        }

        if (state !== stored?.state) {
          throw new Error("State mismatch - possible CSRF attack");
        }

        console.log("Exchanging code for tokens...");
        const tokens = await wixClient.auth.getMemberTokens(
          code,
          state,
          stored
        );
        
        if (!tokens?.accessToken) {
          throw new Error("No access token received");
        }

        console.log("Authentication successful, setting tokens...");
        wixClient.auth.setTokens(tokens);

        // Get and log member info
        try {
          const member = await wixClient.members.getCurrentMember();
          console.log("Member data:", member);
        } catch (memberError) {
          console.error("Failed to fetch member data:", memberError);
          // Continue even if member fetch fails, as tokens are more important
        }

        // Clean up and redirect
        localStorage.removeItem("oauthRedirectData");
        console.log("Redirecting to /home...");
        navigate("/home", { replace: true });

      } 
      catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem("oauthRedirectData");
        navigate("/", { 
          state: { 
            error: "Login failed",
            errorDetails: error.message 
          },
          replace: true
        });
      }
    };

    finishAuth();
  }, [navigate]);

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