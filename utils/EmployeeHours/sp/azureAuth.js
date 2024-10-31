const { ConfidentialClientApplication } = require("@azure/msal-node");

const config = {
    auth: {
      clientId: process.env.AZURE_APP_ID,               // Application (client) ID
      authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,           // Directory (tenant) ID
      clientSecret: process.env.AZURE_CLIENT_SECRET      // Client Secret
    }
  };

// Initialize the MSAL client application
const cca = new ConfidentialClientApplication(config);

async function getAccessToken() {
    try {
      const tokenResponse = await cca.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"], // Use Graph API permissions
      });
      return tokenResponse.accessToken;
    } catch (error) {
      console.error("Error acquiring access token:", error);
      throw error;
    }
  }

module.exports = getAccessToken;
