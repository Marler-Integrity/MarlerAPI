const getGraphClient = require("./msGraphClient");

exports.getFileFromSharePoint = async () => {
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

exports.getFolderNamesFromSharePoint = async () => {
  const client = await getGraphClient();

  try {
    // Get the list of items in the specified folder path
    const folderItems = await client
      .api(`/sites/${process.env.SP_SITE_ID}/drives/${process.env.SP_DRIVE_ID}/root:/Operations/Current:/children`)
      .get();

    // Filter the response to only include folders
    const folders = folderItems.value.filter(item => item.folder).map(folder => folder.name);

    // console.log(folders)

    return folders;
  } catch (error) {
    console.log(error);
  }
}

exports.getListItemsFromSharePoint = async () => {
  const client = await getGraphClient();
  try {
    // Fetch the list items
    const listItems = await client
      .api(`/sites/${process.env.SP_SITE_ID}/lists/${process.env.SP_RENTAL_LIST_ID}/items`)
      // .api(`/sites/${process.env.SP_SITE_ID}/lists`)
      .query({viewId: process.env.SP_RENTAL_VIEW_ID})
      .expand('fields') // Expands to include the fields
      .get();
    
    const columnData = listItems.value.map(item => {
      // Get the first column key of the `fields` object
      const firstColumnKey = Object.keys(item.fields)[1];
      return item.fields[firstColumnKey];
    });
    
    return columnData;
  } catch (error) {
    console.log(error);
  }
}
