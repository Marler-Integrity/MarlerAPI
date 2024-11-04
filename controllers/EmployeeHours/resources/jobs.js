const asyncHandler = require("../../../middleware/async");
const createJobNumberNameModel = require("../../../models/EmployeeHours/JobNumberName");
const ErrorResponse = require("../../../utils/ErrorResponse");

/**
 * @description Get all the people - used for dropdowns/selects
 * @route /api/v1/employeehours/people
 * @access public
 */
exports.getAllJobs = asyncHandler(async(req, res, next) => {
    try {
        const JobNumberName = createJobNumberNameModel(req.db);

        let jobs = await JobNumberName.findAll();

        res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getAllJobs - ${error.message}`));
    }
});