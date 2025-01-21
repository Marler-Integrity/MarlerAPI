const { Sequelize } = require('sequelize');
const createControlDataModel = require('../../models/EmployeeHours/ControlData');
const createPeopleModel = require('../../models/EmployeeHours/People');
const { index } = require('../../models/Subs/Sub');
const { getSAPRefExcelFile, formatExcelFileToArray } = require('../../utils/EmployeeHours/excel/excelUtils');
const ErrorResponse = require('../../utils/ErrorResponse');

/**
 * @description Middleware that checks file "SAPRefV2.xlsx" (master SAP data).
 *              Checks the date in the data file and compares it with control data table from DB
 *              If the data file is newer than we update the Peoples Table in DB with most recent file
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns void
 */
const getSAPRef = async (req, res, next) => {
    
    try {
        let data = await getSAPRefExcelFile();

        let ControlData = createControlDataModel(req.db);

        let dbUpdateDate = await ControlData.findOne({
            order: [['SAPRefUpdatedAt', 'DESC']]
        });

        /**
         * If there is a problem with updating the SAP Ref names (no new names are getting added to db)
         * it has something to do with Control Data Date
         * and the if statement below not being triggered
         * it's getting the updated date from the excel file and comparing to the last time DB was updated
         */
        if (!dbUpdateDate || (new Date(data.sapRefUpdateDate) > new Date(dbUpdateDate.SAPRefUpdatedAt))) {
            //Ref Data is newer than db -> update db

            let spPeoples = formatExcelFileToArray(data.sapRefExcelWorkbook); //sharepoint data into array of objects
            // console.log('HERE',spPeoples)
            let dbPeoples;
            let People;
            try {
                People = createPeopleModel(req.db);
                dbPeoples = await People.findAll();
            } catch (error) {
                throw new Error('Error getting People table from DB');
            }

            const dbPeopleMap = new Map(
                dbPeoples.map(person => [`${person.FirstName}-${person.LastName}`, person])
            );

            const newEntries = []; //to create new entries to People table
            const updates = []; //update existing

            for (const spPerson of spPeoples) {
                const key = `${spPerson.FirstName}-${spPerson.LastName}`;
                const existingPerson = dbPeopleMap.get(key);

                if (!existingPerson) {
                    newEntries.push(spPerson);
                } else {
                    existingPerson.matched = true;
                    updates.push({
                        ...spPerson,
                        PersonID: existingPerson.PersonID
                    });
                }
            }

            //if there are any people that are in the db but not in sap data file we assume they are no longer active
            const unmatchedDBPeople = Array.from(dbPeopleMap.values()).filter(person => !person.matched);

            if (unmatchedDBPeople.length) {
                unmatchedDBPeople.forEach(unmatchedPerson => {
                    updates.push({ PersonID: unmatchedPerson.PersonID, IsActive: false });
                });
            }

            // Use a transaction to batch all database operations together
            await req.db.transaction(async (transaction) => {
                if (newEntries.length) {
                    await People.bulkCreate(newEntries, { transaction });
                }
                if (updates.length) {
                    const updatePromises = updates.map(update =>
                        People.update(
                            { IsActive: update.IsActive, ...update },
                            { where: { PersonID: update.PersonID }, transaction }
                        )
                    );
                    await Promise.all(updatePromises); // Execute all updates in parallel
                }

                // Update ControlData with the latest SAPRefUpdatedAt date
                await ControlData.create(
                    { SAPRefUpdatedAt: Sequelize.literal(`'${new Date().toISOString().split('T')[0]}'`) },
                    { transaction }
                );
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Error Retrieving SAP Ref File`, 500));
    }
}

module.exports = getSAPRef;

