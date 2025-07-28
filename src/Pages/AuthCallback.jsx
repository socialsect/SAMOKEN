// src/Pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishAuth = async () => {
      const stored = JSON.parse(localStorage.getItem("oauthRedirectData"));
      // Support both query and hash params
      let params;
      if (window.location.search) {
        params = new URLSearchParams(window.location.search);
      } else if (window.location.hash) {
        params = new URLSearchParams(window.location.hash.substring(1));
      } else {
        params = new URLSearchParams();
      }
      const code = params.get("code");
      const state = params.get("state");
      console.log("AuthCallback params:", { code, state, stored });

      if (code && state === stored.state) {
        console.log("Code received:", code);
        try {
          const tokens = await wixClient.auth.getMemberTokens(
            code,
            state,
            stored
          );
          // Exchange the code for tokens
          wixClient.auth.setTokens(tokens);

          // await wixClient.auth.authorize({
          //   code,
          //   redirectUri: import.meta.env.VITE_WIX_REDIRECT_URI,
          // });
          // await wixClient.members.getCurrentMember();
          const member = await wixClient.members.getCurrentMember();
          console.log("Member data:", member);
          navigate("/home");
        } catch (err) {
          console.error("OAuth error:", err);
          navigate("/404");
        }
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
