const getGraphClient = require("./msGraphClient");

async function getFileFromSharePoint(siteId, driveId, itemId) {
  const client = await getGraphClient();
  try {
    // Access the file in SharePoint
    const fileContent = await client
      .api(`/sites/${process.env.SP_SITE_ID}/drives/${process.env.SP_DRIVE_ID}/root:/${process.env.SP_FOLDER_PATH}/${process.env.SP_FILE_NAME}:/content`)
      .responseType('arraybuffer')
      .get();

    return fileContent;
  } catch (error) {
    console.error("Error fetching file:", error);
  }
}

module.exports = getFileFromSharePoint;
