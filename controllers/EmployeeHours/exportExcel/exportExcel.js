// const asyncHandler = require("../../../middleware/async");
// const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
// const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
// const createPeopleModel = require("../../../models/EmployeeHours/People");
// const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
// const ErrorResponse = require("../../../utils/ErrorResponse");
// //excel file formatting
// const fs = require('fs');
// const XLSX = require('xlsx');
// const path = require('path');
// //utils
// const { formatShopManagerData, formatProjectManagerData, styleWorksheetColumns, formatDateColumnInSheet} = require("../../../utils/EmployeeHours/excelExport/exportWorkingDataUtils")

// exports.exportWorkingDataToExcel = asyncHandler(async (req, res, next) => {

//     const workingData = req.body.workingData;

//     //check that data is in the form of an array
//     if (!Array.isArray(workingData) || workingData.length === 0) {
//         return next(new ErrorResponse(400, "Invalid input data. Expected an array of workingData."));
//     }

//     //set up models
//     const WorkingData = createWorkingDataModel(req.db)
//     const SubmittedRawData = createSubmittedRawDataModel(req.db);
//     const People = createPeopleModel(req.db);
//     const SAPCategory = createSAPCategoryModel(req.db);

//     try {

//         //get all people and SAP categories
//         //for quicker reference, put in maps
//         const allPeople = await People.findAll({
//             attributes: ["PersonID", "RegSAPCode", "OTSAPCode"],
//             raw: true
//         })

//         const peopleCodesMap = allPeople.reduce((map, person) => {
//             map[person.PersonID] = {
//                 RegSAPCode: person.RegSAPCode,
//                 OTSAPCode: person.OTSAPCode,
//             };
//             return map;
//         }, {})

//         const allSAPCateogries = await SAPCategory.findAll({raw: true})

//         const SAPCategoryMap = allSAPCateogries.reduce((map, {CategoryID, ...category}) => {
//             map[CategoryID] = category;
//             return map;
//         }, {})

//         //format the data with SAP codes
//         const formattedShopManagerData = formatShopManagerData(workingData, peopleCodesMap, SAPCategoryMap)
//         const formattedProjectManagerData = formatProjectManagerData(workingData, SAPCategoryMap)

//          // create file path and directory if it doesn't exist
//         const uploadDir = path.join(__dirname, '..', 'temp_uploads');
//         const shopHoursFilePath = path.join(uploadDir, `ShopHoursWorkbook.xlsx`);

//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir);
//         }

//         //create a new workbook and add the worksheets
//         const workbook = XLSX.utils.book_new();
//         const shopManagerWorksheet = XLSX.utils.json_to_sheet(formattedShopManagerData);
//         const projectManagerWorksheet = XLSX.utils.json_to_sheet(formattedProjectManagerData);

//         //format the dates in the shop manager sheet so they are not just strings
//         formatDateColumnInSheet(shopManagerWorksheet, 2)

//         //style the column widths
//         styleWorksheetColumns(shopManagerWorksheet, "ShopManager")
//         styleWorksheetColumns(projectManagerWorksheet, "ProjectManager")

//         // append the worksheet to the workbook
//         XLSX.utils.book_append_sheet(workbook, shopManagerWorksheet, "ShopManager");
//         XLSX.utils.book_append_sheet(workbook, projectManagerWorksheet, "ProjectManager");

//         // write the workbook to the file
//         XLSX.writeFile(workbook, shopHoursFilePath);

//         // send the file as a downloadable blob response
//         res.download(shopHoursFilePath, async(err) => {
//             if (err) {
//                 throw new Error(err)
//             }

//             //unlink file
//             try {
//                 await fs.promises.unlink(shopHoursFilePath);
//             } catch (unlinkErr) {
//                 throw new Error(unlinkErr)
//             }
//         });

//     } catch (error) {
//         console.error('Error creating the excel file:', error);
//         return next(new ErrorResponse(500, `Server Error - exportWorkingDataToExcel - ${error.message}`));
//     }
// });

const asyncHandler = require("../../../middleware/async");
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const {
  formatShopManagerData,
  formatProjectManagerData,
  styleWorksheetColumns,
  formatDateColumnInSheet,
  styleAndFillShopManagerWorksheet,
  styleAndFillProjectManagerWorksheet,
} = require("../../../utils/EmployeeHours/excelExport/exportWorkingDataUtils");

exports.exportWorkingDataToExcel = asyncHandler(async (req, res, next) => {
  const workingData = req.body.workingData;

  // Check that data is in the form of an array
  if (!Array.isArray(workingData) || workingData.length === 0) {
    return next(
      new ErrorResponse(
        400,
        "Invalid input data. Expected an array of workingData."
      )
    );
  }

  // Set up models
  const WorkingData = createWorkingDataModel(req.db);
  const SubmittedRawData = createSubmittedRawDataModel(req.db);
  const People = createPeopleModel(req.db);
  const SAPCategory = createSAPCategoryModel(req.db);

  try {
    // Get all people and SAP categories
    const allPeople = await People.findAll({
      attributes: ["PersonID", "RegSAPCode", "OTSAPCode"],
      raw: true,
    });

    const peopleCodesMap = allPeople.reduce((map, person) => {
      map[person.PersonID] = {
        RegSAPCode: person.RegSAPCode,
        OTSAPCode: person.OTSAPCode,
      };
      return map;
    }, {});

    const allSAPCategories = await SAPCategory.findAll({ raw: true });

    const SAPCategoryMap = allSAPCategories.reduce(
      (map, { CategoryID, ...category }) => {
        map[CategoryID] = category;
        return map;
      },
      {}
    );

    // Format the data with SAP codes
    const formattedShopManagerData = formatShopManagerData(
      workingData,
      peopleCodesMap,
      SAPCategoryMap
    );
    const formattedProjectManagerData = formatProjectManagerData(
      workingData,
      SAPCategoryMap
    );

    // Create file path and directory if it doesn't exist
    const uploadDir = path.join(__dirname, "..", "temp_uploads");
    const shopHoursFilePath = path.join(uploadDir, `ShopHoursWorkbook.xlsx`);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add ShopManager worksheet
    const shopManagerWorksheet = workbook.addWorksheet("ShopManager");
    styleAndFillShopManagerWorksheet(
      formattedShopManagerData,
      shopManagerWorksheet
    );
    // if (formattedShopManagerData.length > 0) {
    //   const headers = Object.keys(formattedShopManagerData[0]);
    //   shopManagerWorksheet.addRow(headers); // Add headers
    //   formattedShopManagerData.forEach((row) => {
    //     shopManagerWorksheet.addRow(Object.values(row)); // Add data rows
    //   });
    // }

    // Add ProjectManager worksheet
    const projectManagerWorksheet = workbook.addWorksheet("ProjectManager");
    // if (formattedProjectManagerData.length > 0) {
    //   const headers = Object.keys(formattedProjectManagerData[0]);
    //   projectManagerWorksheet.addRow(headers); // Add headers
    //   formattedProjectManagerData.forEach((row) => {
    //     projectManagerWorksheet.addRow(Object.values(row)); // Add data rows
    //   });
    // }

    styleAndFillProjectManagerWorksheet(
      formattedProjectManagerData,
      projectManagerWorksheet
    );

    // Write the workbook to the file
    await workbook.xlsx.writeFile(shopHoursFilePath);

    // Send the file as a downloadable blob response
    res.download(shopHoursFilePath, async (err) => {
      if (err) {
        throw new Error(err);
      }

      // Unlink file after sending
      try {
        await fs.promises.unlink(shopHoursFilePath);
      } catch (unlinkErr) {
        console.error("Error deleting the file:", unlinkErr);
      }
    });
  } catch (error) {
    console.error("Error creating the excel file:", error);
    return next(
      new ErrorResponse(
        500,
        `Server Error - exportWorkingDataToExcel - ${error.message}`
      )
    );
  }
});
