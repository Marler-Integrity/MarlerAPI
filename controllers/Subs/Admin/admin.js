//middleware and utils
const asyncHandler = require('../../../middleware/async');
const ErrorResponse = require('../../../utils/ErrorResponse');

//models
const Sub = require('../../../models/Subs/Sub');

//@desc     Get all Employee Names
//@route    GET /api/v1/subs/admin/employee
//@access   Private - Teams Authentication
exports.getEmployeeNames = asyncHandler(async (req, res, next) => {
    let users = [];
    let names = await Sub.find().distinct('user');
 
    names.forEach((name, i) => {
        let user = {
            key: i,
            text: name
        }
        users.push(user);
    })

    res.status(200).json({
        success: true,
        data: users
    });
});

//@desc     Get all Employee Names
//@route    GET /api/v1/subs/admin?
//@access   Private - Teams Authentication
exports.getEmployeeData = asyncHandler(async (req, res, next) => {
    let userData = await Sub.find({user: req.query.user});

    res.status(200).json({
        success: true,
        data: userData
    })
});