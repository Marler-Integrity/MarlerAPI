const asyncHandler = require("../../../middleware/async");
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const ErrorResponse = require("../../../utils/ErrorResponse");

const { Op } = require("sequelize");

/**
 * @author Julia Hack
 * @date November 13, 2024
 * @route  POST /api/v1/employeehours/shop/working-data
 * @description saves working data and updates employee entries to 'Locked'
 * @access private - management user must be logged in to submit entries
 */
exports.saveWorkingData = asyncHandler(async (req, res, next) => {
  const { workingData, employeeEntryIDs } = req.body;

  const transaction = await req.db.transaction();

  //set up models
  const WorkingData = createWorkingDataModel(req.db);
  const SubmittedRawData = createSubmittedRawDataModel(req.db);

  try {
    //get WorkingDataIDs
    const existingWorkingDataIds = workingData
      .filter((entry) => entry.WorkingDataID)
      .map((entry) => entry.WorkingDataID);

    // Delete entries not present in the incoming entries
    await WorkingData.destroy({
      where: { WorkingDataID: { [Op.notIn]: existingWorkingDataIds } },
      transaction,
    });

    // Separate new and existing entries
    const newEntries = workingData
      .filter((entry) => !entry.WorkingDataID)
      .map(({ WorkingDataID, ...entry }) => entry);
    const existingEntries = workingData.filter((entry) => entry.WorkingDataID);

    // Bulk create new entries
    const createdEntries = await WorkingData.bulkCreate(newEntries, {
      transaction,
    });

    // Bulk update existing entries
    for (const entry of existingEntries) {
      await WorkingData.update(entry, {
        where: { WorkingDataID: entry.WorkingDataID },
        transaction,
      });
    }

    //update submittedRawData entries to Locked, if not already
    const [affectedRows] = await SubmittedRawData.update(
      { Locked: true }, // The fields to update
      {
        where: {
          SRDID: { [Op.in]: employeeEntryIDs },
          Locked: false, // Second condition: only update if Locked is false
        },
        transaction,
      }
    );

    // Commit transaction
    await transaction.commit();

    // Only return the new entries with WorkingDataID and FrontEndID
    const newIds = createdEntries.map((entry) => ({
      WorkingDataID: entry.WorkingDataID,
      FrontEndID: entry.FrontEndID, // assuming FrontEndID is stored or sent from the frontend
    }));

    res.status(200).json({
      success: true,
      data: {
        newIds,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return next(
      new ErrorResponse(
        `Server Error - autoSaveWorkingData - ${error.message}`,
        500
      )
    );
  }
});

/**
 * @author Julia Hack
 * @date November 13, 2024
 * @route  GET /api/v1/employeehours/shop/working-data
 * @description gets all working data in WorkingData table
 * @access private - management user must be logged in to see entries
 */
exports.getWorkingData = asyncHandler(async (req, res, next) => {
  try {
    const SubmittedRawData = createSubmittedRawDataModel(req.db);
    const WorkingData = createWorkingDataModel(req.db);
    const People = createPeopleModel(req.db);

    if (!SubmittedRawData.associations.People) {
      SubmittedRawData.belongsTo(People, {
        foreignKey: "PeopleID",
        targetKey: "PersonID",
      });
    }

    const workingData = await WorkingData.findAll();

    //initialize results
    let submittedRawData = [];
    let workingDataMap = {};

    //if no working data saved, get all the submitted raw entries
    if (workingData.length === 0) {
      submittedRawData = await SubmittedRawData.findAll({
        where: {
          Submitted: false,
        },
        include: [
          {
            model: People,
            attributes: ["FirstName", "LastName"],
          },
        ],
      });
    } else {
      //if there is working data saved, just get the "locked" raw entries
      submittedRawData = await SubmittedRawData.findAll({
        where: {
          Locked: true,
          Submitted: false,
        },
        include: [
          {
            model: People,
            attributes: ["FirstName", "LastName"],
          },
        ],
      });

      //format  working data into map structure so it can be queried by SRDID on frontend
      workingData.forEach((entry) => {
        if (workingDataMap.hasOwnProperty(entry.SRDID)) {
          workingDataMap[entry.SRDID] = [...workingDataMap[entry.SRDID], entry];
        } else {
          workingDataMap[entry.SRDID] = [entry];
        }
      });
    }

    //format raw data to include people details on same level as entry
    const formattedSubmittedData = submittedRawData.map((entry) => {
      const entryData = entry.toJSON();
      const { Person, ...entryDetails } = entryData;

      return {
        ...entryDetails,
        FirstName: Person.FirstName,
        LastName: Person.LastName,
      };
    });

    //return result
    res.status(200).json({
      success: true,
      data: {
        submittedRawData: formattedSubmittedData,
        workingData: workingDataMap,
      },
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`Server Error - getWorkingData - ${error.message}`, 500)
    );
  }
});
