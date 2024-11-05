const asyncHandler = require("../../../middleware/async");
const createUserModel = require("../../../models/EmployeeHours/User");
const ErrorResponse = require("../../../utils/ErrorResponse");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @date Oct 30, 2024
 * @author Bryan Lilly
 * @description Login in an existing user
 * @route POST /api/v1/employeehours/auth/login
 * @access Public endpoint - Anyone can try to login
 **/
exports.userLogin = asyncHandler(async (req, res, next) => {
    try {
        //This creates the user model to be used with sequelize
        const User = await createUserModel(req.db);

        const { Email, Password } = req.body;

        let user = await User.findOne({ where: { Email: Email } });

        if (!user) {
            return next(new ErrorResponse(`Email is incorrect`, 401));
        }
        if (!user.IsActive) return next(new ErrorResponse(`Not Authorized - Inactive User`, 401))

        //check for matching passwords
        const pwMatch = await bcrypt.compare(Password, user.Password);

        if (!pwMatch) {
            return next(new ErrorResponse('Password Incorrect', 401));
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

/**
 * @date Oct 30, 2024
 * @author Julia Hack
 * @description Register
 * @route POST /api/v1/employehours/auth/register
 * @access Logged in users with Manager role
 * 
 **/
exports.userRegister = asyncHandler(async(req, res, next) => {
    try {

        const { Email, Password, FirstName, LastName } = req.body;

        //requried criteria
        if(!Email || !Password || !FirstName || !LastName) return next(new ErrorResponse(`Please include Email, Password, FirstName and LastName in Request`, 400));
        
        //This creates the user model to be used with sequelize
        const User = createUserModel(req.db);

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return next(new ErrorResponse(`Email already in use`, 400));
        }
        //hash password and set to object
        const hash = await bcrypt.hash(Password, 10);
    
        req.body.Password = hash;

        //create user
        const user = await User.create(req.body);

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
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: expiry});
    
        res.status(200).json({
            success: true,
            token
        });   
    } catch (error) {
        console.log(error)
        if(error.errors[0] = 'ValidationErrorItem'){
            if(error.message === 'Validation error'){
                msg = 'Email already in use'
            } else {
                msg = error.message
            }
            return next(new ErrorResponse(msg, 400));    
        }
        return next(new ErrorResponse(`Error Creating User - Register - ${error.message}`, 500 ));
    }

});