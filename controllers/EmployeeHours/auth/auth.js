const asyncHandler = require("../../../middleware/async");
const createUserModel = require("../../../models/EmployeeHours/User");
const ErrorResponse = require("../../../utils/ErrorResponse");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @description Login in an existing user
 * @route POST /api/v1/employehours/auth/login
 * @access Public endpoint - Anyone can try to login
 */
exports.userLogin = asyncHandler(async (req, res, next) => {
    try {
        //This creates the user model to be used with sequelize
        const User = createUserModel(req.db);

        const { Email, Password } = req.body;

        let user = User.findOne({ where: { Email: Email } });

        if (!user) {
            return next(new ErrorResponse(401, `Email is incorrect`));
        }
        if (!user.IsActive) return next(new ErrorResponse(401, `Not Authorized - Inactive User`))

        //check for matching passwords
        const pwMatch = await bcrypt.compare(Password, user.Password);

        if (!pwMatch) {
            return next(new ErrorResponse(401, 'Password Incorrect'));
        }

        //jwt payload
        const payload = {
            UserID: user.UserID,
            Email: user.Email,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Role: user.Role
        }

        const expiry = '8h'; //jwt expires in 8 hours

        //jwt token for authorization
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse('Server Error - userLogin', 500));
    }
});