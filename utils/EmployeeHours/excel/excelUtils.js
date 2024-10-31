const xlsx = require('xlsx');
const getFileFromSharePoint = require('../sp/fetchSPFileContent');

exports.getSAPRefExcelFile = async() => {
    const fileContent = await getFileFromSharePoint();

    const workbook = xlsx.read(Buffer.from(fileContent), {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];

    return sheetName;
}
