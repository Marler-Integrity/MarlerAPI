const { Client } = require("@microsoft/microsoft-graph-client");
const getAccessToken = require("./azureAuth");

require("isomorphic-fetch"); // Needed for node-fetch compatibility

async function getGraphClient() {
  const accessToken = await getAccessToken();

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken); // This provides the access token to Microsoft Graph
    },
  });

  return client;
}

module.exports = getGraphClient;

