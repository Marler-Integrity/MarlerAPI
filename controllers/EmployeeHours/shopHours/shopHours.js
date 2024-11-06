const asyncHandler = require("../../../middleware/async");
const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
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
 * @description gets all active entries
 */
exports.getAllEntries = asyncHandler(async (req, res, next) => {

    //set up models
    const MasterRawEntry = createMasterRawEntryModel(req.db);
    const SubmittedRawData = createSubmittedRawDataModel(req.db);
    const People = createPeopleModel(req.db);

    if (!MasterRawEntry.associations.SubmittedRawData) {
        MasterRawEntry.hasMany(SubmittedRawData, { foreignKey: 'MasterID' });
        SubmittedRawData.belongsTo(MasterRawEntry, { foreignKey: 'MasterID' });
        MasterRawEntry.belongsTo(People, { foreignKey: 'PeopleID', targetKey: 'PersonID' });
    }

    //get submittedRawData and people for each masterRawEntry
    const employeeMasterEntries = await MasterRawEntry.findAll({
        include: [
            {
                model: SubmittedRawData,
                required: false
            },
            {
                model: People,
                attributes: ['FirstName', 'LastName', 'PersonID'],

            }
        ],
    });

    //format data to get array of submitted raw entries
    const submittedDataArray = employeeMasterEntries.reduce((acc, masterEntry) => {
        const masterData = masterEntry.toJSON(); 
        const { SubmittedRawData: submittedDataItems, ...masterDetails } = masterData;

        // for each SubmittedRawData item, attach the master and Person details
        const employeeEntries = submittedDataItems.map(submittedData => ({
            ...submittedData,
            MasterID: masterDetails.MasterID,
            EntryDate: masterDetails.EntryDate,
            FirstName: masterDetails.Person.FirstName,
            LastName: masterDetails.Person.LastName,
            PersonID: masterDetails.Person.PersonID,
        }));
    
        // accumulate all entries
        return acc.concat(employeeEntries);
    }, []);

    try {
        
        res.status(200).json({
            success: true,
            data: submittedDataArray
        });
    } catch (error) {
        console.log(error)
        return next(new ErrorResponse(`Server Error - getAllEntries - ${error.message}`, 500));
    }
});