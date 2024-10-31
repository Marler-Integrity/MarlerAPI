const {getSAPRefExcelFile} = require('../../utils/EmployeeHours/excel/excelUtils');
const ErrorResponse = require('../../utils/ErrorResponse');

const getSAPRef = async(req, res, next) => {
    try {
        let sapRef = await getSAPRefExcelFile();

        console.log(sapRef);
        next();
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Error Retrieving SAP Ref File`, 500));
    }
}

module.exports = getSAPRef;