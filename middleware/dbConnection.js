const { getMongoConnection, getMssqlConnection } = require('../config/db');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @author Bryan Lilly @date Oct 29, 2024
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @desc This will determine which database to use and attache the db connection to the request object
 */
const dbConnection = async(req, res, next) => {
    const endpoint = req.path.split('/')[3]; //!test the endpoints to make sure it's grabbing the right one

    try {
        switch (endpoint){
        case 'checklist':
        case 'hotels':
        case 'subs':
        case 'users':
            req.db = getMongoConnection();
            req.dbType = 'mongo';
            break;
        case 'employeehours':
            req.db = await getMssqlConnection();
            req.dbType = 'mssql';
            break;
        default:
            return next(new ErrorResponse(`Could not determine route for database ${endpoint}`, 400));
    }
    next();
    } catch (error) {
        next(error);
    }
}

module.exports = dbConnection;