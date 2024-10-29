//middleware and utils
const asyncHandler = require('../../../middleware/async');
const ErrorResponse = require('../../../utils/ErrorResponse');

//models
const SubSchema = require('../../../models/Subs/Sub');

//@desc     Get all Employee Names
//@route    GET /api/v1/subs/admin/employee
//@access   Private - Teams Authentication
exports.getEmployeeNames = asyncHandler(async (req, res, next) => {
    const Sub = req.db.model('Sub', SubSchema);
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
    const Sub = req.db.model('Sub', SubSchema);
    let userData = await Sub.find({user: req.query.user});

    res.status(200).json({
        success: true,
        data: userData
    })
});

//@desc     Approve Employee subs
//@route    GET /api/v1/subs/admin/approve
//@access   Private - Teams Authentication
exports.approveSubs = asyncHandler(async (req, res, next) => {
    const Sub = req.db.model('Sub', SubSchema);
    req.body.forEach(async(sub) => {
        await Sub.findByIdAndUpdate(sub, {approved: true});
    });

    res.status(200).json({
        success: true,
        msg: 'Subs have been sucessfully updated'
    })
});