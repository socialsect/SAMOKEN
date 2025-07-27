// src/pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          console.error("Wix OAuth error:", error);
          navigate("/error");
          return;
        }

        if (!code) {
          console.error("No authorization code found in URL");
          navigate("/");
          return;
        }

        try {
          await wixClient.auth.authorize({
            code,
            redirectUri: `${window.location.origin}/callback`,
          });

          // Force a hard navigation to /home to ensure proper routing
          window.location.href = "/home";
        } catch (err) {
          console.error("Wix OAuth failed:", err);
          navigate("/error");
        }
      } catch (err) {
        console.error("Error in exchangeCode:", err);
        navigate("/error");
      }
    };

    exchangeCode();
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
