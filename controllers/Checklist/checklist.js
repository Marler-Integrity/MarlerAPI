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

//@desc     Update a checklist item by ID
//@route    GET /api/v1/checklist/:id
//@access   Public
exports.updateChecklistItem = asyncHandler(async(req, res, next) => {
    try {
        let item = await ChecklistItem.findByIdAndUpdate(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: item
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - updateChecklistItem`, 500));
    }
});

//@desc     Update an array of checklist items
//@route    GET /api/v1/checklist/tabnames
//@access   Public
exports.updateMultipleItems = asyncHandler(async(req, res, next) => {
    const itemsToUpdate = req.body;

    const bulkOps = itemsToUpdate.map(item => ({
        updateOne: {
            filter: {_id: item._id},
            update: {$set: item}
        }
    }));
    
    try {
        const result = await ChecklistItem.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - updateMultipleItems`, 500));
    }
});