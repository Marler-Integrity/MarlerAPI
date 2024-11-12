const asyncHandler = require("../../../middleware/async");
// const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const ErrorResponse = require("../../../utils/ErrorResponse");
const { v4: uuidv4 } = require('uuid');

/**
 * @route  POST /api/v1/employeehours/shop/submit
 * @access public
 */
exports.submitShopHours = asyncHandler(async (req, res, next) => {
    let t = await req.db.transaction()
    try {
        const SubmittedRawData = createSubmittedRawDataModel(req.db);
        
        const { EntryDate, PeopleID, entries } = req.body;  //entries is an array of objects - each object is an entry 

        if (!entries.length) return next(new ErrorResponse(`There are no Entries in Request`, 400));
        if (!EntryDate || !PeopleID) return next(new ErrorResponse(`Request Must Include Date and Person`));

        const formatSQLDate = (date) => {
            return date.toISOString();
        };

        const masterId = uuidv4();

        for (let entry of entries) {
            await SubmittedRawData.create(
                {
                    ...entry,  // Spread entry data
                    EntryDate: formatSQLDate(new Date(EntryDate)),  // Format date
                    PeopleID: PeopleID,
                    MasterID: masterId  // Generate unique ID
                },
                { transaction: t }  // Ensure each create operation is part of the transaction
            );
        }

        await t.commit();
        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.log(error)
        await t.rollback();
        return next(new ErrorResponse(`Server Error - submitShopHours - ${error.message}`, 500));
    }
});

/**
 * @route  POST /api/v1/employeehours/shop/submissions/:peopleid
 * @access private - user must be logged in to see hours
 */
exports.getEmployeeHourSubmissions = asyncHandler(async (req, res, next) => {
    const peopleID = req.params.peopleid;
    try {
        // const MasterRawEntry = createMasterRawEntryModel(req.db);
        const SubmittedRawData = createSubmittedRawDataModel(req.db);

        // Define associations
        // if (!MasterRawEntry.associations.SubmittedRawData) {
        //     MasterRawEntry.hasMany(SubmittedRawData, { foreignKey: 'MasterID' });
        //     SubmittedRawData.belongsTo(MasterRawEntry, { foreignKey: 'MasterID' });
        // }

        let employeeHourSubmissions = await SubmittedRawData.findAll({
            where: { PeopleID: peopleID }
        });

        res.status(200).json({
            success: true,
            data: employeeHourSubmissions
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getEmployeeHourSubmissions - ${error.message}`));
    }
});