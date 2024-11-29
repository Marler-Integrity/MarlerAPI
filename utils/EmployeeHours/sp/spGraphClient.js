const { Client } = require("@microsoft/microsoft-graph-client");
const { getSharePointAccessToken } = require("./azureAuth");

require("isomorphic-fetch"); // Needed for node-fetch compatibility

async function getSPGraphClient() {
  const accessToken = await getSharePointAccessToken();

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken); // This provides the access token to Microsoft Graph
    },
  });

  return client;
}

module.exports = getSPGraphClient;

