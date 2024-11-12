const asyncHandler = require("../../../middleware/async");
// const createMasterRawEntryModel = require("../../../models/EmployeeHours/MasterRawEntry");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const createPeopleModel = require("../../../models/EmployeeHours/People");
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