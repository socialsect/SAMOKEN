// src/pages/AuthCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import wixClient from "../wixClient";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          await wixClient.auth.authorize({
            code,
            redirectUri: "http://localhost:3000/auth/callback", // Must match what you added to Wix settings
          });

          // (Optional) You can now call APIs or store login status
          navigate("/home");
        } catch (err) {
          console.error("Wix OAuth failed:", err);
          navigate("/error");
        }
      }
    };

    exchangeCode();
  }, [navigate]);

  return <div>Logging in with Wix…</div>;
};

export default AuthCallback;
