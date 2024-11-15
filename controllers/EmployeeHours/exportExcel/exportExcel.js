const asyncHandler = require("../../../middleware/async");
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");
//excel file formatting
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

exports.exportWorkingDataToExcel = asyncHandler(async (req, res, next) => {
    
    const workingData = req.body.workingData;

    //check that data is in the form of an array
    if (!Array.isArray(workingData) || workingData.length === 0) {
        return next(new ErrorResponse(400, "Invalid input data. Expected an array of workingData."));
    }

    //set up models
    const WorkingData = createWorkingDataModel(req.db)
    const SubmittedRawData = createSubmittedRawDataModel(req.db);
    const People = createPeopleModel(req.db);
    const SAPCategory = createSAPCategoryModel(req.db);

   
      
    try {

        //get all people and SAP categories
        //for quick reference, put in maps
        const allPeople = await People.findAll({
            attributes: ["PersonID", "RegSAPCode", "OTSAPCode"],
            raw: true
        })


        const peopleCodesMap = allPeople.reduce((map, person) => {
            map[person.PersonID] = {
                RegSAPCode: person.RegSAPCode,
                OTSAPCode: person.OTSAPCode,
            };
            return map;
        }, {})

        const allSAPCateogries = await SAPCategory.findAll({raw: true})

        const SAPCategoryMap = allSAPCateogries.reduce((map, {CategoryID, ...category}) => {
            map[CategoryID] = category;
            return map;
        }, {})

        console.log(peopleCodesMap)
        console.log(SAPCategoryMap)


        const formattedShopManagerData = formatShopManagerData(workingData, peopleCodesMap, SAPCategoryMap)
        const formattedProjectManagerData = formatProjectManagerData(workingData, SAPCategoryMap)

        console.log(formattedShopManagerData)
        console.log(formattedProjectManagerData)


         // create file path and directory if it doesn't exist
        const uploadDir = path.join(__dirname, '..', 'temp_uploads');
        const shopHoursFilePath = path.join(uploadDir, `ShopHoursWorkbook.xlsx`);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        //create a new workbook and add a new worksheet
        const workbook = XLSX.utils.book_new();
        const shopManagerWorksheet = XLSX.utils.json_to_sheet(formattedShopManagerData);
        const projectManagerWorksheet = XLSX.utils.json_to_sheet(formattedProjectManagerData);

        // append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, shopManagerWorksheet, `ShopManager`);
        XLSX.utils.book_append_sheet(workbook, projectManagerWorksheet, `ProjectManager`);

        // write the workbook to the file
        XLSX.writeFile(workbook, shopHoursFilePath);

        // send the file as a downloadable blob response
        res.download(shopHoursFilePath, async(err) => {
            if (err) {
                throw new Error(err)
            }

            //unlink file
            try {
                await fs.promises.unlink(shopHoursFilePath);
            } catch (unlinkErr) {
                throw new Error(unlinkErr)
            }
        });
        // res.status(200).json({
        //     success: true,
        //     data: {
        //         formattedShopManagerData,
        //         formattedProjectManagerData
        //     }
        // });
        
    } catch (error) {
        console.error('Error creating the excel file:', error);
        return next(new ErrorResponse(500, `Server Error - exportWorkingDataToExcel - ${error.message}`));
    } 
});

const formatShopManagerData = (data, peopleCodesMap, SAPCategoryMap) => {
    const formattedData = data.flatMap(entry => {

        const separatedEntries = []

        if(!entry.SAPCategory) return separatedEntries

        if(entry.Regular > 0 ){
            separatedEntries.push({
                "SubjobID": SAPCategoryMap[entry.SAPCategory].SubCategoryNumber,
                "Staff": `${entry.FirstName} ${entry.LastName}`,
                "Date": formatDate(entry.EntryDate),
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
                "Date": formatDate(entry.EntryDate),
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

const formatProjectManagerData = (data, SAPCategoryMap) => {
    //get all the non-billable entries those without a JobName

    const nonBillable = []
    const billable = []
    
    data.forEach(entry => {
        const sapCategory = SAPCategoryMap[String(entry.SAPCategory)]
        console.log("sapCategory")
        
        console.log(sapCategory)

        console.log("entry")
        console.log(entry)


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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    // const formattedDate = new Intl.DateTimeFormat('en-CA', {
    //     year: 'numeric',
    //     month: '2-digit',
    //     day: '2-digit'
    // }).format(date);

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',  
        year: '2-digit'
    }).format(new Date());

    return formattedDate;
}