// src/wixClient.js
import { createClient, OAuthStrategy } from "@wix/sdk";
import { items } from "@wix/data";

const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: "8def304e-af6a-4400-bc11-7f72c6d43837",
  }),
});

export default wixClient;
