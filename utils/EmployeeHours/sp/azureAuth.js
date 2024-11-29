// const { ConfidentialClientApplication } = require("@azure/msal-node");

// const config = {
//     auth: {
//       clientId: process.env.AZURE_APP_ID,               // Application (client) ID
//       authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,           // Directory (tenant) ID
//       clientSecret: process.env.AZURE_CLIENT_SECRET      // Client Secret
//     }
//   };

// // Initialize the MSAL client application
// const cca = new ConfidentialClientApplication(config);

// async function getAccessToken() {
//     try {
//       const tokenResponse = await cca.acquireTokenByClientCredential({
//         scopes: ["https://graph.microsoft.com/.default"], // Use Graph API permissions
//       });
//       console.log(tokenResponse.accessToken)
//       return tokenResponse.accessToken;
//     } catch (error) {
//       console.error("Error acquiring access token:", error);
//       throw error;
//     }
//   }

// module.exports = getAccessToken;

const { ConfidentialClientApplication } = require("@azure/msal-node");

const sharepointConfig = {
  auth: {
    clientId: process.env.SP_AZURE_APP_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.SP_AZURE_CLIENT_SECRET,
  },
};

const directoryConfig = {
  auth: {
    clientId: process.env.AZURE_APP_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

// Initialize MSAL clients
const sharepointClient = new ConfidentialClientApplication(sharepointConfig);
const directoryClient = new ConfidentialClientApplication(directoryConfig);

async function getSharePointAccessToken() {
  try {
    const tokenResponse = await sharepointClient.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"], // Replace with SharePoint scope
    });
    return tokenResponse.accessToken;
  } catch (error) {
    console.error("Error acquiring SharePoint access token:", error);
    throw error;
  }
}

async function getDirectoryAccessToken() {
  try {
    const tokenResponse = await directoryClient.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"], // Microsoft Graph scope for directory
    });
    return tokenResponse.accessToken;
  } catch (error) {
    console.error("Error acquiring Directory access token:", error);
    throw error;
  }
}

module.exports = { getSharePointAccessToken, getDirectoryAccessToken };
