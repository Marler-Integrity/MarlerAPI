const XLSX = require('xlsx');

exports.formatShopManagerData = (data, peopleCodesMap, SAPCategoryMap) => {
    const formattedData = data.flatMap(entry => {

        const separatedEntries = []

        if(!entry.SAPCategory) return separatedEntries

        if(entry.Regular > 0 ){
            separatedEntries.push({
                "SubjobID": SAPCategoryMap[entry.SAPCategory].SubCategoryNumber,
                "Staff": `${entry.FirstName} ${entry.LastName}`,
                "Date": entry.EntryDate,
                "Time Type": "Standard",
                "Quantity": entry.Regular,
                "Non-Chargable": null,
                "Item No.": String(peopleCodesMap[entry.PeopleID].RegSAPCode).padStart(5, 0)

            })
        }

        if(entry.OT > 0 ){
            separatedEntries.push({
                "SubjobID": SAPCategoryMap[entry.SAPCategory].SubCategoryNumber,
                "Staff": `${entry.FirstName} ${entry.LastName}`,
                "Date": entry.EntryDate,
                "Time Type": "Overtime",
                "Quantity": entry.OT,
                "Non-Chargable": null,
                "Item No.": String(peopleCodesMap[entry.PeopleID].OTSAPCode).padStart(5, 0)

            })
        }

        return separatedEntries
        
    })
    return formattedData
}

exports.formatProjectManagerData = (data, SAPCategoryMap) => {
    //get all the non-billable entries those without a JobName

    const nonBillable = []
    const billable = []
    
    data.forEach(entry => {
        const sapCategory = SAPCategoryMap[String(entry.SAPCategory)]
        
        if(!entry.JobName){
            nonBillable.push({
                "Employee Name": `${entry.FirstName} ${entry.LastName}`,
                "Job Title": `${sapCategory.SubCategoryNumber} ${sapCategory.SubCategoryName}`,
                "Job Name/Number": null,
                "Billable/Non-billable": "Non-Billable",
                "Hrs": entry.Regular,
                "O.T Hrs": entry.OT,
                "Equipment": entry.Notes
            })
        } else {
            billable.push({
                "Employee Name": `${entry.FirstName} ${entry.LastName}`,
                "Job Title": null,
                "Job Name/Number": entry.JobName,
                "Billable/Non-billable": "Billable",
                "Hrs": entry.Regular,
                "O.T Hrs": entry.OT,
                "Equipment": entry.Notes
            })
        }
            
    })

    return [
        ...nonBillable.sort((a, b) => a["Job Title"] - b["Job Title"]),
        {},
        ...billable.sort((a, b) => a["Job Name/Number"] - b["Job Name/Number"])
      ]


}


exports.styleWorksheetColumns = (worksheet, type) => {
    if(type === "ShopManager"){
        const columnCount = Object.keys(worksheet)
        .filter(key => key.match(/^[A-Z]+1$/)) // Match header cells (e.g., A1, B1, etc.)
        .length;

        worksheet['!cols'] = Array(columnCount).fill({ wch: 20 });
    }
    if(type === "ProjectManager"){
        worksheet['!cols'] = [
            { wch: 30 }, 
            { wch: 30 }, 
            { wch: 40 }, 
            { wch: 20 }, 
            { wch: 10 }, 
            { wch: 10 }, 
            { wch: 40 }, 
          ];
    }
}


const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date; 
};

exports.formatDateColumnInSheet = (worksheet, dateColumnIndex) => {
    const range = XLSX.utils.decode_range(worksheet['!ref']); // Get range of the worksheet

    // Loop over the rows in the worksheet (excluding the header row)
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const dateCell = XLSX.utils.encode_cell({ r: row, c: dateColumnIndex }); // Get cell reference
        const dateString = worksheet[dateCell]?.v; // Get the cell value (date string)

        if (dateString) {
            const formattedDate = formatDate(dateString); // Convert to a Date object
            worksheet[dateCell] = {
                t: 'd', // Type is 'd' for date
                v: formattedDate,
                z: 'dd-mmm-yy', // Custom date format (Excel-friendly)
            };
        }
    }
};