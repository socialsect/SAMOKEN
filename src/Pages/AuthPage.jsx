import React from "react";
import "../Styles/AuthPage.css"; // Assuming you have a CSS file for styling
import { Link } from "react-router-dom"; // For your internal navigation
import { createClient, OAuthStrategy } from "@wix/sdk"; // Crucial Wix SDK imports
import Cookies from "js-cookie"; // To initialize the Wix client with any existing session tokens

// Your Wix OAuth Client ID
const CLIENT_ID = "ae6977a5-70fe-403a-80f0-58809d4cfcf6";

// Initialize the Wix client outside the component if it's meant to be a singleton
// This client will be used to generate the Wix login URL.
// It's initialized with any existing session tokens from the cookie,
// which is good practice, though not strictly necessary for *initiating* login.
const myWixClient = createClient({
  auth: OAuthStrategy({
    clientId: CLIENT_ID,
    // Attempt to parse existing tokens from the 'session' cookie.
    // If the cookie doesn't exist, JSON.parse(null) or JSON.parse('null') would result in null.
    tokens: JSON.parse(Cookies.get("session") || 'null'),
  }),
});

const AuthPage = () => {
  /**
   * Handles the click event for the "LOG IN WITH WIX" button.
   * This function initiates the Wix member login (OAuth) flow.
   */
  const handleWixLogin = async () => {
    try {
      // 1. Define the redirect URI for the OAuth flow.
      // This is the URL of your LoginCallback.jsx page.
      // IMPORTANT: This URI MUST be registered exactly in your Wix Developers Console
      // under your OAuth app's "Allowed authorization redirect URIs".
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const redirectUri = isLocalhost 
        ? 'http://localhost:5173/auth/callback' 
        : 'https://runner-orpin.vercel.app/auth/callback';

      // 2. Define the original URI.
      // This is the page the user was on *before* they clicked the login button.
      // Wix will redirect the user back to your 'redirectUri' with the login code,
      // and your 'LoginCallback.jsx' will then use this 'originalUri' to send the user
      // back to where they started in your app.
      const originalUri = window.location.href; // Captures the current URL (e.g., http://localhost:3000/auth)

      // 3. Generate OAuth data for the secure PKCE flow.
      // The Wix SDK handles the creation of necessary security parameters (like code_verifier and state).
      const oauthData = myWixClient.auth.generateOAuthData(
        redirectUri,
        originalUri
      );

      // 4. Store the generated OAuth data in localStorage.
      // This data will be retrieved by LoginCallback.jsx to complete the PKCE flow
      // when Wix redirects the user back. It's a temporary storage.
      localStorage.setItem("oauthRedirectData", JSON.stringify(oauthData));

      // 5. Request the Wix authentication URL from the SDK.
      // This is the URL on Wix's domain that the user will be redirected to for login.
      // The SDK includes your CLIENT_ID and all other required OAuth parameters in this URL.
      const { authUrl } = await myWixClient.auth.getAuthUrl(oauthData);

      // 6. Redirect the user's browser to the Wix authentication URL.
      // This will take the user away from your app to Wix's login page.
      window.location.href = authUrl;

    } catch (error) {
      console.error("Error initiating Wix login:", error);
      // Provide user feedback in case of an error during the login initiation
      alert("Failed to start login process. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <img
          src="/Logos/THE RUNNER-LOGOS-02.svg"
          alt="RUNNER Logo"
          className="auth-logo"
          width={400}
        />

        <div className="auth-welcome-text">
          <h2>WELCOME TO THE RUNNER APP</h2>
          <p>
            Join our community, find out which putter is your best fit, set it
            up and improve your putting!
          </p>
        </div>

        <div className="auth-buttons">
          {/* Your existing Register button */}
          <Link to="/signup">
            <button className="register-btn">REGISTER</button>
          </Link>
          {/* Your existing Login button (if it's for your own login system) */}
          <Link to="/login">
            <button className="login-btn">LOG IN</button>
          </Link>

          {/* This is the corrected Wix Login button */}
          <button
            onClick={handleWixLogin}
            className="login-btn" // Reusing your existing button style
            style={{ backgroundColor: "#4c4c4c", color: "white", marginTop: '10px' }} // Added margin for separation
          >
            LOG IN WITH WIX
          </button>
        </div>
      </div>

      <footer className="auth-footer">
        <div className="auth-language-selector">
          <img src="icons/eng.png" alt="GB" className="lang-icon" />
        </div>
        <div className="auth-help-privacy">
          <a href="/help" className="auth-help-link">
            Help
          </a>
          <a href="/privacy" className="auth-privacy-link">
            Privacy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;