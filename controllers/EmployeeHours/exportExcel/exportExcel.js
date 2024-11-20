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

    // Add ProjectManager worksheet
    const projectManagerWorksheet = workbook.addWorksheet("ProjectManager");

    styleAndFillProjectManagerWorksheet(
      formattedProjectManagerData,
      projectManagerWorksheet
    );

    // Write the workbook to the file
    await workbook.xlsx.writeFile(shopHoursFilePath);

    //update all currently locked submittedRawData entries to submitted
    const [affectedRows] = await SubmittedRawData.update(
      { Submitted: true },
      {
        where: {
          // SRDID: { [Op.in]: employeeEntryIDs },
          Locked: true,
        },
      }
    );

    //clear working data
    await WorkingData.destroy({ where: {} });

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
