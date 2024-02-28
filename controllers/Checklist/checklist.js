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
        let item = await ChecklistItem.findById(req.params.id);

        if(item['Last Done'] !== req.body['Last Done']){
            await ItemCompleted.create({itemID: item._id, completedAt: req.body['Last Done']});
        }

        let newItem = await ChecklistItem.findByIdAndUpdate(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: newItem
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

//@desc     Create a new checklist item
//@route    POST /api/v1/checklist
//@access   Public
exports.createNewChecklistItem = asyncHandler(async(req, res, next) => {
    try {
        let item = await ChecklistItem.create(req.body);

        if(!item) return next(new ErrorResponse(`Error Creating Checklist Item`, 400));

        res.status(200).json({
            success: true,
            data: item
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - createNewChecklistItem`, 500));
    }
});

//@desc     Delete a checklist item
//@route    DELETE /api/v1/checklist/:id
//@access   Public
exports.deleteChecklistItem = asyncHandler(async(req, res, next) => {
    try {
        let item = await ChecklistItem.findByIdAndDelete(req.params.id);

        if(!item) return next(new ErrorResponse(`Error deleting Checklist Item with ID ${req.params.id}`, 400));

        res.status(200).json({
            success: true,
            data: item
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - createNewChecklistItem`, 500));
    }
});

//@desc     Delete an array of checklist items - tab has been removed
//@route    DELETE /api/v1/checklist/tabremoved
//@access   Public
exports.deleteArrayOfItems = asyncHandler(async(req, res, next) => {
    const itemsToDelete = req.body;

    const bulkOps = itemsToDelete.map((item) => ({
        deleteOne: {
            filter: {_id: item._id}
        }
    }));
    
    try {
        const result = await ChecklistItem.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse('Server Error - deleteArrayOfItems'), 500);
    }
});