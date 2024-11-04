const asyncHandler = require("../../../middleware/async");
const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const ErrorResponse = require("../../../utils/ErrorResponse");


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
            masterEntry = await MasterRawEntry.create({ EntryDate, PeopleID }, { transaction: t });
        } catch (error) {
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