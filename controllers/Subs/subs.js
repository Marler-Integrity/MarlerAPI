//middleware and utils
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

//models
const Sub = require('../../models/Subs/Sub');

//@desc     Get all Sub Documents - by username or admin(all docs)
//@route    GET /api/v1/subs/
//@access   Public
exports.getAllSubs = asyncHandler(async (req, res, next) => {
    // let username = '*';
    let subDocs;
    
    if(req.query.user){
        username = req.query.user;
        
        subDocs = await Sub.find({ user: username });
    } else {
        subDocs = await Sub.find();
    }

    
    res.status(200).json({
        success: true,
        data: subDocs
    });
});

//@desc     Create Sub Document
//@route    POST /api/v1/subs/
//@access   Public - signed in through MS Teams
exports.createSub = asyncHandler(async (req, res, next) => {
    let sub = await Sub.create(req.body);

    res.status(200).json({
        success: true,
        data: sub
    });
});

//@desc     Edit Sub Document by ID
//@route    PUT /api/v1/subs/[id]
//@access   Public - signed in through MS Teams
exports.updateSub = asyncHandler(async (req, res, next) => {
    let sub = await Sub.findByIdAndUpdate(req.params.id, req.body, {new: true});
    
    if(!sub){
        return next(new ErrorResponse(`Cannot find Sub Document with ID ${req.parms.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: sub
    });
});

//@desc     Delete Sub Document by ID
//@route    DELETE /api/v1/subs/[id]
//@access   Public - signed in through MS Teams
exports.deleteSub = asyncHandler(async (req, res, next) => {
    try {
        await Sub.findByIdAndDelete(req.params.id);    
    } catch (error) {
        return next(new ErrorResponse(`Error deleting document with ID ${req.params.id}`))
    }
    
    
    res.status(200).json({
        success: true,
        data: {
            msg: `Sub Document successfully deleted`
        }
    });
});