const asyncHandler = require("../../../middleware/async");
const createPeopleModel = require("../../../models/EmployeeHours/People");
const createUserModel = require("../../../models/EmployeeHours/User");
const { getUserProfile } = require("../../../utils/EmployeeHours/azure/userProfiles");
const ErrorResponse = require("../../../utils/ErrorResponse");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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
exports.userRegister = asyncHandler(async (req, res, next) => {
    try {

        const { Email, Password, FirstName, LastName } = req.body;

        //requried criteria
        if (!Email || !Password || !FirstName || !LastName) return next(new ErrorResponse(`Please include Email, Password, FirstName and LastName in Request`, 400));

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
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        console.log(error)
        if (error.errors[0] = 'ValidationErrorItem') {
            if (error.message === 'Validation error') {
                msg = 'Email already in use'
            } else {
                msg = error.message
            }
            return next(new ErrorResponse(msg, 400));
        }
        return next(new ErrorResponse(`Error Creating User - Register - ${error.message}`, 500));
    }

});

/**
 * @date Nov 15, 2024
 * @author Bryan Lilly
 * @description Register a field employee -> Saving data to People table 
 * @route POST /api/v1/employehours/auth/register/field
 * @access Public *user must have a marlerintegrity account for validation
 * 
 **/
exports.fieldUserRegister = asyncHandler(async (req, res, next) => {
    try {
        const { Email, Password } = req.body;

        if(!Email || !Password) return next(new ErrorResponse(`Please Provide an Email and Password in Request`, 400))

        const azureUserData = await getUserProfile(Email);

        const People = createPeopleModel(req.db);

        const person = await People.findOne({ where: { LastName: azureUserData.surname } });

        if (!person) return next(new ErrorResponse(`Could Not Find Your Name in Our System`, 404));

        let token = crypto.randomBytes(32).toString("hex");
        let verificationLink = `${process.env.SITE_URL}/verify-email/${token}`;
        const mailObject = {
            sendTo: Email,
            subject: `Verify Your Email Address`,
            text: `${verificationLink}`,
            html: getHTML(verificationLink)
        }

        try {
            const result = await sendVerificationEmail(mailObject);
            //hash password and set to object
            const hash = await bcrypt.hash(Password, 10);
            person.Password = hash;
            person.Verified = false;
            person.Email = Email;
            
            await person.save();

            res.status(200).json({
                success: true,
                msg: `Please Verify Your Email Address`
            });
        } catch (error) {
            throw error;
        }
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - fieldUserRegister - ${error.message}`));
    }
});

/**
 * @date Nov 15, 2024
 * @author Bryan Lilly
 * @description Verify email address
 * @route POST /api/v1/employehours/auth/register/field/:verificationToken
 * @access Public *user must have a marlerintegrity account for validation
 * 
 **/
exports.verifyEmail = asyncHandler(async(reg, res, next) => {
    try {
        let token = req.params.verificationToken;
        if(!token) return next(new ErrorResponse(`Invalid Verification Link`, 400));

        const People = createPeopleModel(req.db);

        let person = await People.findOne({where: {Token: token, Verified: false}});

        if(!person) return next(new ErrorResponse(`Invalid Verification Token - Try Again`, 400));

        person.Verified = true;
        await person.save();

        res.status(200).json({
            success: true,
            msg: `Email is Verified`
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - verifyEmail - ${error.message}`));
    }
});

const getHTML = (verificationLink) => {
    return (
        `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f9f9f9;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        padding: 20px;
                    }
                    .header {
                        background: #4CAF50;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                    }
                    .cta-button {
                        display: inline-block;
                        margin: 20px 0;
                        padding: 12px 20px;
                        background: #4CAF50;
                        color: white;
                        text-decoration: none;
                        font-size: 16px;
                        border-radius: 4px;
                    }
                    .cta-button:hover {
                        background: #45a049;
                    }
                    .footer {
                        text-align: center;
                        font-size: 12px;
                        color: #777;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>Thank you for signing up! Please verify your email address to complete the registration process.</p>
                        <a href="{${verificationLink}}" class="cta-button">Verify Email Address</a>
                        <p>If you did not create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Marler Integrity Inc. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>`
    )
}