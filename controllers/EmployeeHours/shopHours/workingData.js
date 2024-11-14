const asyncHandler = require("../../../middleware/async");
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const createSubmittedRawDataModel = require("../../../models/EmployeeHours/SubmittedRawData");
const ErrorResponse = require("../../../utils/ErrorResponse");

const { Op } = require('sequelize');

/**
 * @author Julia Hack
 * @date November 13, 2024
 * @route  POST /api/v1/employeehours/shop/working-data
 * @description saves working data and updates employee entries to 'Locked'
 * @access private - management user must be logged in to submit entries
 */
exports.saveWorkingData = asyncHandler(async (req, res, next) => {
    const { entries } = req.body;
    const transaction = await req.db.transaction();

    //set up models
    const WorkingData = createWorkingDataModel(req.db)
    const SubmittedRawData = createSubmittedRawDataModel(req.db)
  
    try {

      //get WorkingDataIDs
      const existingWorkingDataIds = entries
        .filter(entry => entry.WorkingDataID)
        .map(entry => entry.WorkingDataID);

      //get SRDIDs so we can update raw data to locked
      const SRDIDs = Array.from(new Set(entries.map(entry => entry.SRDID)));
  
      // Delete entries not present in the incoming entries
      await WorkingData.destroy({
        where: { WorkingDataID: { [Op.notIn]: existingWorkingDataIds } },
        transaction,
      });
  
      // Separate new and existing entries
      const newEntries = entries.filter(entry => !entry.WorkingDataID);
      const existingEntries = entries.filter(entry => entry.WorkingDataID);
  
      // Bulk create new entries
      const createdEntries = await WorkingData.bulkCreate(newEntries, { transaction });
  
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
            SRDID: { [Op.in]: SRDIDs },
            Locked: false // Second condition: only update if Locked is false
          },
          transaction,
        }
      );

      console.log(affectedRows)
  
      // Commit transaction
      await transaction.commit();
      
  
      // Only return the new entries with WorkingDataID and FrontEndID
      const newIds = createdEntries.map(entry => ({
        WorkingDataID: entry.WorkingDataID,
        FrontEndID: entry.FrontEndID,  // assuming FrontEndID is stored or sent from the frontend
      }));
  
      res.status(200).json({
        success: true,
        data: {
            newIds
        }
    });

    } catch (error) {
      await transaction.rollback();
      console.log(error)
      return next(new ErrorResponse(`Server Error - autoSaveWorkingData - ${error.message}`, 500));
    }
})

/**
 * @author Julia Hack
 * @date November 13, 2024
 * @route  GET /api/v1/employeehours/shop/working-data
 * @description gets all working data in WorkingData table
 * @access private - management user must be logged in to see entries
 */
exports.getWorkingData = asyncHandler(async (req, res, next) => { 

  try {
    const WorkingData = createWorkingDataModel(req.db)

    const workingData = await WorkingData.findAll()

    //format data into map structure so it can be queried by SRDID on frontend
    const workingDataMap = {}

    workingData.forEach(entry => {
      if(workingDataMap.hasOwnProperty(entry.SRDID)){
        workingDataMap[entry.SRDID] = [...workingDataMap[entry.SRDID], entry]
      } else {
        workingDataMap[entry.SRDID] = [entry]
      }
    })
    
    res.status(200).json({
      success: true,
      data: workingDataMap
    })

  } catch (error) {
    console.log(error)
    return next(new ErrorResponse(`Server Error - autoSaveWorkingData - ${error.message}`, 500));
  }
})
