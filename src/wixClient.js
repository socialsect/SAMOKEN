// src/wixClient.js
import { createClient, OAuthStrategy } from "@wix/sdk";
import { members } from "@wix/members";
import { redirects } from "@wix/redirects";
const cid = "ae6977a5-70fe-403a-80f0-58809d4cfcf6";
const redirectUri = "https://runner-orpin.vercel.app/auth/callback"; // Ensure this matches your app's registered redirect URI

const wixClient = createClient({
  modules: { members, redirects },
  auth: OAuthStrategy({
    clientId: cid,  
    redirectUri: redirectUri,
  }),
});

export default wixClient;
