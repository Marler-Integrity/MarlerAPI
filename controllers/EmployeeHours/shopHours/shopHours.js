const asyncHandler = require("../../../middleware/async");
const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const ErrorResponse = require("../../../utils/ErrorResponse");


/**
 * @route  POST /api/v1/employeehours/shop/submit
 * @access public
 */
exports.submitShopHours = asyncHandler(async (req, res, next) => {
    let t = await req.db.transaction()
    try {
        const SubmittedRawData = createSubmittedRawDataModel(req.db);
        const MasterRawEntry = createMasterRawEntryModel(req.db);

        const { EntryDate, PeopleID, entries } = req.body;  //entries is an array of objects - each object is an entry 

        if (!entries.length) return next(new ErrorResponse(`There are no Entries in Request`, 400));
        if (!EntryDate || !PeopleID) return next(new ErrorResponse(`Request Must Include Date and Person`));

        let masterEntry = null;
        try {
            console.log(EntryDate)
            const formatSQLDate = (date) => {
                // console.log(date)
                // const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                return date.toISOString();
            };

            masterEntry = await MasterRawEntry.create({ EntryDate: formatSQLDate(new Date(EntryDate)), PeopleID }, { transaction: t });
        } catch (error) {
            console.log(error)
            throw new Error(`Error Creating Master Raw Entry - ${error.message}`);
        }

        const masterEntryID = masterEntry.MasterID;

        // Create all entries in the SubmittedRawData table using `Promise.all`
        await Promise.all(
            entries.map(async (entry) => {
                // Add `masterEntryID` to each entry as a foreign key, if needed
                await SubmittedRawData.create(
                    {
                        ...entry, // Spread the entry data
                        MasterID: masterEntryID // Add the reference to the master entry
                    },
                    { transaction: t }
                );
            })
        );

        await t.commit();
        res.status(200).json({
            success: true
        });
    } catch (error) {
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
        const MasterRawEntry = createMasterRawEntryModel(req.db);
        const SubmittedRawData = createSubmittedRawDataModel(req.db);

        // Define associations
        if (!MasterRawEntry.associations.SubmittedRawData) {
            MasterRawEntry.hasMany(SubmittedRawData, { foreignKey: 'MasterID' });
            SubmittedRawData.belongsTo(MasterRawEntry, { foreignKey: 'MasterID' });
        }

        let employeeHourSubmissions = await MasterRawEntry.findAll({
            where: { PeopleID: peopleID },
            include: [
                {
                    model: SubmittedRawData,
                    required: false
                }
            ]
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