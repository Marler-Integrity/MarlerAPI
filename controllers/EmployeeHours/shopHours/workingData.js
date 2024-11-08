const asyncHandler = require("../../../middleware/async");
const createWorkingDataModel = require("../../../models/EmployeeHours/WorkingData");
const ErrorResponse = require("../../../utils/ErrorResponse");

const { Op } = require('sequelize');

exports.autoSaveWorkingData = asyncHandler(async (req, res, next) => {
    const { entries } = req.body;
    const transaction = await req.db.transaction();
    const WorkingData = createWorkingDataModel(req.db)
  
    try {
      const existingIds = entries
        .filter(entry => entry.WorkingDataID)
        .map(entry => entry.WorkingDataID);
  
      // Delete entries not present in the incoming entries
      await WorkingData.destroy({
        where: { WorkingDataID: { [Op.notIn]: existingIds } },
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
      return next(new ErrorResponse(`Server Error - autoSaveWorkingData - ${error.message}`, 500));
    }
})
