const asyncHandler = require("../../../middleware/async");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");

/**
 * @description Get all the categories - used for dropdowns/selects
 * @route /api/v1/employeehours/categories
 * @access public
 */
exports.getAllCategories = asyncHandler(async(req, res, next) => {
    try {
        let Categories = createSAPCategoryModel(req.db);

        let categories = await Categories.findAll();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getAllCategories - ${error.message}`));
    }
}); 