const { Client } = require("@microsoft/microsoft-graph-client");
const {getDirectoryAccessToken} = require("../sp/azureAuth");

require("isomorphic-fetch"); // Needed for node-fetch compatibility

async function getDIRGraphClient() {
  const accessToken = await getDirectoryAccessToken();

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken); // This provides the access token to Microsoft Graph
    },
  });

  return client;
}

module.exports = getDIRGraphClient;

