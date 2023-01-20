//middleware and utils
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

//models
const User = require('../../models/Users/User');

//@desc     Get all Users (for admin purposes)
//@route    GET /api/v1/users/
//@access   Public
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    let adminUsers = await User.find();
    
    res.status(200).json({
        success: true,
        data: adminUsers
    });
});

//@desc     Create a User (for admin purposes)
//@route    POST /api/v1/users/
//@access   Public
exports.createUser = asyncHandler(async (req, res, next) => {
    let adminUser = await User.create(req.body);

    res.status(200).json({
        success: true,
        data: adminUser
    });
});

//@desc     Update a User (for admin purposes)
//@route    PUT /api/v1/users/[id]
//@access   Public
exports.updateUser = asyncHandler(async (req, res, next) => {
    let adminUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});

    if(!adminUser){
        return next(new ErrorResponse('Cannot find this user', 404));
    }

    res.status(200).json({
        success: true,
        data: adminUser
    });
});

//@desc     Delete a User (for admin purposes)
//@route    DELETE /api/v1/users/[id]
//@access   Public
exports.deleteUser = asyncHandler(async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
    } catch (error) {
        return next(new ErrorResponse(`Error deleting user with ID of ${req.params.id}`));
    }

    res.status(200).json({
        success: true,
        data: 'User successfully deleted'
    });
});