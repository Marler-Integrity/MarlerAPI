const asyncHandler = require("../../../middleware/async");
//models
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const createArchivedDataModel = require("../../../models/EmployeeHours/ArchivedData");
//packages
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
//utils
const ErrorResponse = require("../../../utils/ErrorResponse");
const {
  formatShopManagerData,
  formatProjectManagerData,
  styleAndFillShopManagerWorksheet,
  styleAndFillProjectManagerWorksheet,
} = require("../../../utils/EmployeeHours/excelExport/exportWorkingDataUtils");

/**
 * @date Nov 26, 2024
 * @author Julia Hack
 * @description Formats working data into spreadsheets
 * @route POST /api/v1/employeehours/manager-verification/export-excel
 * @access Manager users
 * 
 * @example Expected in req.body:
 * {
        entriesToKeep: [int],
        workingData: 
          [
            {
              WorkingDataID: int,
              LastName: string,
              FirstName: string,
              JobName: string,
              NumHours: float,
              Description: string,
              SAPCategory: int
              Notes: string,
              Regular: float,
              OT: float,
              SRDID: int,
              PeopleID: int,
              EntryDate: date,
              FrontEndID: string,
              IsCopy: boolean
            }
          ]
  }

 *  Response: downloadable file
 */
exports.exportWorkingDataToExcel = asyncHandler(async (req, res, next) => {
  const { workingData, entriesToKeep } = req.body;

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
  const People = createPeopleModel(req.db);
  const SAPCategory = createSAPCategoryModel(req.db);

  const transaction = await req.db.transaction();

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

    //update submittedRawData, archive working data
    await cleanUpData(entriesToKeep, workingData, transaction, req.db);

    await transaction.commit();

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
    await transaction.rollback();
    return next(
      new ErrorResponse(
        500,
        `Server Error - exportWorkingDataToExcel - ${error.message}`
      )
    );
  }
});

const cleanUpData = async (entriesToKeep, workingData, transaction, db) => {
  try {
    //set up models
    const WorkingData = createWorkingDataModel(db);
    const SubmittedRawData = createSubmittedRawDataModel(db);
    const ArchivedData = createArchivedDataModel(db);

    //update submittedAt for SubmittedRawData and ArchivedData
    //adding unique submission id to all the archived items
    const SubmissionID = uuidv4();
    const SubmittedAt = new Date().toISOString();

    //update all currently locked submittedRawData entries to submitted
    await SubmittedRawData.update(
      {
        Submitted: true,
        SubmittedAt,
        Discarded: true,
      },
      {
        where: {
          SRDID: { [Op.notIn]: entriesToKeep },
          Locked: true,
        },
        transaction,
      }
    );

    //format data for archiving
    const dataToArchive = workingData.map(({ WorkingDataID, ...item }) => ({
      ...item,
      SubmissionID,
      SubmittedAt,
    }));

    await ArchivedData.bulkCreate(dataToArchive, { transaction });

    //clear working data from database and commit changes
    await WorkingData.destroy({ where: {}, transaction });
  } catch (error) {
    return next(
      new ErrorResponse(
        500,
        `Server Error - exportWorkingDataToExcel - ${error.message}`
      )
    );
  }
};
