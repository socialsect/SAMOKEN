// src/wixClient.js
import { createClient, OAuthStrategy } from "@wix/sdk";
import { members } from "@wix/members";
import { redirects } from "@wix/redirects";

const cid = import.meta.env.VITE_WIX_CLIENT_ID;

const getRedirectUri = () => {
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  return isLocalhost 
    ? 'http://localhost:5173/auth/callback' 
    : 'https://runner-orpin.vercel.app/auth/callback';
};

const wixClient = createClient({
  modules: { members, redirects },
  auth: OAuthStrategy({
    clientId: cid,
    redirectUri: getRedirectUri(),
  }),
});

export default wixClient;