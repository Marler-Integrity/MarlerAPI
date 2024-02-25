//middleware and utils
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

//models
const ChecklistItem = require('../../models/checklist/ChecklistItem');
const ItemCompleted = require('../../models/checklist/ItemCompleted');

//@desc     Get All data
//@route    GET /api/v1/checklist/
//@access   Public
exports.getAllChecklistItems = asyncHandler(async(req, res, next) => {
    try {
        let checklistItems = await ChecklistItem.find();

        res.status(200).json({
            success: true,
            data: checklistItems
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getAllChecklistItems`, 500))
    }
});