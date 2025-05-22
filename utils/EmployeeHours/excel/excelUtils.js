const xlsx = require('xlsx');
const {getFileFromSharePoint} = require('../sp/fetchSPContent');
const {exclusionList} = require("./exclusionList");

exports.getSAPRefExcelFile = async() => {
    const fileContent = await getFileFromSharePoint();

    const workbook = xlsx.read(Buffer.from(fileContent), {type: 'buffer'});
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const cellValue = sheet['A1'] ? sheet ['A1'].v : null;

    if(cellValue){
        const date = new Date(Math.round((cellValue - 25569) * 86400 * 1000));
        return {sapRefUpdateDate: date, sapRefExcelWorkbook: workbook};
    } else {
        throw new Error('Cell A1 is empty or not found');
    }
}

exports.formatExcelFileToArray = (workbook) => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    let foundData = null;

    for(let i =0; i < rows.length; i++){
        const row = rows[i];

        if(row[0] === "People"){
            const dataBegins = row[1];
            const dataEnds = row[2];

            foundData = {dataBegins, dataEnds}
            break;
        }
    }

    

    let peopleArray = [];
    for(let i = Number(foundData.dataBegins)-1; i < Number(foundData.dataEnds); i++){
        let row = rows[i];

        if(exclusionList.some(obj => obj.LastName === row[1])) continue;

        const peopleObject = {
            LastName: row[0],
            FirstName: row[1],
            RegSAPCode: Number(row[2]),
            OTSAPCode: Number(row[3]),
            SubSAPCode: Number(row[4]),
            NSubSAPCode: 102,
            IsActive: true
        }
        peopleArray.push(peopleObject);
    }

    return peopleArray;
}

