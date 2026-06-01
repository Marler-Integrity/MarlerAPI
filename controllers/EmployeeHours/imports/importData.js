const asyncHandler = require("../../../middleware/async");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");
const xlsx = require('xlsx');
const { validateSubJobHeaders, EXPECTED_HEADERS } = require('./validateSubJobHeaders');

/**
 * Trims leading/trailing whitespace from the header-row cells of a worksheet
 * in place, so the keys produced by xlsx.utils.sheet_to_json match the
 * validated (trimmed) header names. Without this, a header like "NAME " would
 * pass validation but make item['NAME'] return undefined during the import.
 */
function trimWorksheetHeaders(worksheet) {
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const headerRowIndex = range.s.r;
    for (let c = range.s.c; c <= range.e.c; c++) {
        const address = xlsx.utils.encode_cell({ r: headerRowIndex, c });
        const cell = worksheet[address];
        if (cell && cell.v != null) {
            const trimmed = String(cell.v).trim();
            cell.v = trimmed;
            cell.w = trimmed;
            cell.t = 's';
        }
    }
}

/**
 * @description this route/controller is for importing the internal job numbers for SAP
 *              this only needs to be done once a year
 *              As of Jan 21, 2025 there is no UI for uploads - must be done through postman
 */
exports.importInternalJobList = asyncHandler(async (req, res, next) => {
    try {
        if (!req.file) return next(new ErrorResponse(`No File Uploaded`, 400));

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Validate the header row BEFORE any destructive database operation,
        // so a wrong file never truncates the SAPCategory table.
        const rawHeaders = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];
        const validation = validateSubJobHeaders(rawHeaders);
        if (!validation.valid) {
            return next(new ErrorResponse(
                `Invalid file layout. Expected headers [${EXPECTED_HEADERS.join(', ')}] ` +
                `but the uploaded file did not match (${validation.reason}).`,
                400
            ));
        }

        // Normalize header cells so the import's column lookups use the same
        // trimmed names validation just checked.
        trimWorksheetHeaders(worksheet);
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        let SAPCategory = createSAPCategoryModel(req.db);

        await SAPCategory.destroy({
            where: {},
            truncate: true
        });

        let formattedData = jsonData.map(item => {
            return {
                CategoryName: item['NAME'],
                CategoryNumber: item['JOB#'],
                SubCategoryName: item['Desc'],
                SubCategoryNumber: item['SubJob#']
            }
        });

        await SAPCategory.bulkCreate(formattedData);

        res.status(200).json({
            success: true
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - importInternalJobList - ${error.message}`, 500));
    }
});
