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

    //Step 1: set up models
    const MasterRawEntry = createMasterRawEntryModel(req.db);
    const SubmittedRawData = createSubmittedRawDataModel(req.db);
    const People = createPeopleModel(req.db);

    // Step 2: get all master entries - assuming that old master entries will be archived and these are all current
    const masterRawEntries = await MasterRawEntry.findAll({raw:true});

    // Step 3: get peopleIds and masterIds from masterRawEntries
    const peopleIds = [...new Set(masterRawEntries.map(entry => entry.PeopleID))]; 
    const masterIds = masterRawEntries.map(entry => entry.MasterID);
    
    // Step 4: get people and submittedRawData
    const [people, submittedData] = await Promise.all([
        People.findAll({
            where: { PersonID: peopleIds },
            attributes: ['FirstName', 'LastName', 'PersonID'],
            raw: true,
        }),
        SubmittedRawData.findAll({
            where: { MasterID: masterIds },
            raw: true,
        }),
    ]);

    // Step 5: create result object of submitted raw entries, with person data and entry date from master entry
    const result = submittedData.map(entry => {

        const masterEntry = masterRawEntries.find(masterEntry => masterEntry.MasterID === entry.MasterID)
        const person = people.find(person => person.PersonID === masterEntry.PeopleID)
 
        return {
            ...entry,
            ...person,
            EntryDate: masterEntry.EntryDate
        };
    });

    try {
        
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.log(error)
        return next(new ErrorResponse(`Server Error - getAllEntries - ${error.message}`, 500));
    }
});