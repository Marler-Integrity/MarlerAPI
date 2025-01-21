const asyncHandler = require("../../../middleware/async");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");
const xlsx = require('xlsx');

/**
 * @description this route/controller is for importing the internal job numbers for SAP
 *              this only needs to be done once a year
 *              As of Jan 21, 2025 there is no UI for uploads - must be done through postman
 */
exports.importInternalJobList = asyncHandler(async(req, res, next) => {
    try {
        if(!req.file) return next(new ErrorResponse(`No File Uploaded`, 400));

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        let SAPCategory = createSAPCategoryModel(req.db);

        await SAPCategory.destroy({
            where: {},
            truncate: true
        });

        let formattedData = jsonData.map(item => {
            return {
                CategoryName: item['NAME'],
                CategoryNumber: item['JOB#'],
                SubCategoryName: item['Desc'],
                SubCategoryNumber: item['SubJob#']
            }
        });

        await SAPCategory.bulkCreate(formattedData);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - importInternalJobList - ${error.message}`, 500));
    }
});