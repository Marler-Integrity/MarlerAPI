const asyncHandler = require("../../../middleware/async");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const ErrorResponse = require("../../../utils/ErrorResponse");

/**
 * @description Get all the people - used for dropdowns/selects
 * @route /api/v1/employeehours/people
 * @access public
 */
exports.getAllPeople = asyncHandler(async(req, res, next) => {
    try {
        let People = createPeopleModel(req.db);

        let people = await People.findAll();

        res.status(200).json({
            success: true,
            data: people
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getAllPeople - ${error.message}`));
    }
}); 