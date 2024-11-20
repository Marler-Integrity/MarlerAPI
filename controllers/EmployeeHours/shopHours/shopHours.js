const asyncHandler = require("../../../middleware/async");
// const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const {
  getUserProfile,
} = require("../../../utils/EmployeeHours/azure/userProfiles");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const ErrorResponse = require("../../../utils/ErrorResponse");
const { v4: uuidv4 } = require("uuid");

/**
 * @route  POST /api/v1/employeehours/shop/submit
 * @access public
 */
exports.submitShopHours = asyncHandler(async (req, res, next) => {
  let t = await req.db.transaction();
  try {
    const SubmittedRawData = createSubmittedRawDataModel(req.db);

    const { EntryDate, PeopleID, entries } = req.body; //entries is an array of objects - each object is an entry

    if (!entries.length)
      return next(new ErrorResponse(`There are no Entries in Request`, 400));
    if (!EntryDate || !PeopleID)
      return next(new ErrorResponse(`Request Must Include Date and Person`));

    const formatSQLDate = (date) => {
      return date.toISOString();
    };

    const masterId = uuidv4();

    for (let entry of entries) {
      await SubmittedRawData.create(
        {
          ...entry, // Spread entry data
          EntryDate: formatSQLDate(new Date(EntryDate)), // Format date
          PeopleID: PeopleID,
          MasterID: masterId, // Generate unique ID
        },
        { transaction: t } // Ensure each create operation is part of the transaction
      );
    }

    await t.commit();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    return next(
      new ErrorResponse(
        `Server Error - submitShopHours - ${error.message}`,
        500
      )
    );
  }
});

/**
 * @route  POST /api/v1/employeehours/shop/submissions
 * @access private - user must be logged in to update submissions
 */
exports.updateSubmissions = asyncHandler(async (req, res, next) => {
  let t = await req.db.transaction();
  try {
    const entries = req.body;

    if (!entries)
      return next(new ErrorResponse(`No Entries Present in Request`, 400));

    const SubmittedRawData = createSubmittedRawDataModel(req.db);

    for (let entry of entries) {
      await SubmittedRawData.update(
        { ...entry },
        {
          where: { SRDID: entry.SRDID },
          transaction: t,
        }
      );
    }
    await t.commit();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    await t.rollback();
    console.log(error);
    return next(
      new ErrorResponse(
        `Server Error - updateSubmissions - ${error.message}`,
        500
      )
    );
  }
});

/**
 * @route  DELETE /api/v1/employeehours/shop/submissions/delete/:srdid
 * @access private - user must be logged in to see hours
 */
exports.deleteEntry = asyncHandler(async (req, res, next) => {
  try {
    const srdid = req.params.srdid;
    if (!srdid) return next(new ErrorResponse(`No SRDID in request`, 400));

    const SubmittedRawData = createSubmittedRawDataModel(req.db);

    try {
      let result = await SubmittedRawData.destroy({ where: { SRDID: srdid } });
    } catch (error) {
      throw new Error("Error Deleting Entry");
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`Server Error - deleteEntry - ${error.message}`)
    );
  }
});

/**
 * @route  POST /api/v1/employeehours/shop/submissions/:peopleid
 * @access private - user must be logged in to see hours
 */
exports.getEmployeeHourSubmissions = asyncHandler(async (req, res, next) => {
  getUserProfile("bryan.lilly@marlerintegrity.com");
  const peopleID = req.params.peopleid;
  try {
    const SubmittedRawData = createSubmittedRawDataModel(req.db);

    let employeeHourSubmissions = await SubmittedRawData.findAll({
      where: { PeopleID: peopleID },
    });

    res.status(200).json({
      success: true,
      data: employeeHourSubmissions,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(
        `Server Error - getEmployeeHourSubmissions - ${error.message}`
      )
    );
  }
});

/**
 * @author Julia Hack
 * @date November 13, 2024
 * @route  GET /api/v1/employeehours/shop/entries
 * @description gets all raw entries
 * @access private - management user must be logged in to see entries
 */
exports.getUnlockedEntries = asyncHandler(async (req, res, next) => {
  try {
    //set up models
    const SubmittedRawData = createSubmittedRawDataModel(req.db);
    const People = createPeopleModel(req.db);

    if (!SubmittedRawData.associations.People) {
      SubmittedRawData.belongsTo(People, {
        foreignKey: "PeopleID",
        targetKey: "PersonID",
      });
    }

    //get submittedRawData and people for each masterRawEntry
    const submittedRawData = await SubmittedRawData.findAll({
      where: {
        Locked: false,
        Submitted: false,
      },
      include: [
        {
          model: People,
          attributes: ["FirstName", "LastName"],
        },
      ],
    });

    //format entries to include employee's first and last name on same level as the rest of the data
    const submittedDataArray = submittedRawData.map((entry) => {
      const entryData = entry.toJSON();
      const { Person, ...entryDetails } = entryData;

      return {
        ...entryDetails,
        FirstName: Person.FirstName,
        LastName: Person.LastName,
      };
    });

    res.status(200).json({
      success: true,
      data: submittedDataArray,
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorResponse(`Server Error - getAllEntries - ${error.message}`, 500)
    );
  }
});
