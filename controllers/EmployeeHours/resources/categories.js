const asyncHandler = require("../../../middleware/async");
const createSAPCategoryModel = require("../../../models/EmployeeHours/SAPCategory");
const ErrorResponse = require("../../../utils/ErrorResponse");

/**
 * @description Get all the categories - used for dropdowns/selects
 * @route /api/v1/employeehours/categories
 * @access public
 */
exports.getAllCategories = asyncHandler(async(req, res, next) => {
    try {
        let Categories = createSAPCategoryModel(req.db);

        let categories = await Categories.findAll();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorResponse(`Server Error - getAllCategories - ${error.message}`));
    }
});

/**
 * @description Apply a frontend-computed diff of SAPCategory rows in a single
 *              transaction (all-or-nothing). Order: delete -> update -> create.
 * @route POST /api/v1/employeehours/categories/batch
 * @access manager/admin
 */
exports.batchUpdateCategories = asyncHandler(async (req, res, next) => {
    const SAPCategory = createSAPCategoryModel(req.db);

    const create = Array.isArray(req.body?.create) ? req.body.create : [];
    const update = Array.isArray(req.body?.update) ? req.body.update : [];
    const remove = Array.isArray(req.body?.delete) ? req.body.delete : [];

    const isInt = (v) => Number.isInteger(v);
    const isText = (v) => typeof v === 'string' && v.trim().length > 0;

    // CategoryNumber/SubCategoryNumber must be non-null integers; names must be non-empty strings.
    const validateRow = (row, requireId) => {
        if (requireId && !isInt(row?.CategoryID)) return 'missing valid CategoryID';
        if (!isInt(row?.CategoryNumber)) return 'CategoryNumber must be a non-null integer';
        if (!isInt(row?.SubCategoryNumber)) return 'SubCategoryNumber must be a non-null integer';
        if (!isText(row?.CategoryName)) return 'CategoryName is required';
        if (!isText(row?.SubCategoryName)) return 'SubCategoryName is required';
        return null;
    };

    for (const row of create) {
        const err = validateRow(row, false);
        if (err) return res.status(400).json({ success: false, message: `Invalid create row: ${err}` });
    }
    for (const row of update) {
        const err = validateRow(row, true);
        if (err) return res.status(400).json({ success: false, message: `Invalid update row: ${err}` });
    }
    for (const id of remove) {
        if (!isInt(id)) return res.status(400).json({ success: false, message: `Invalid delete id: must be an integer` });
    }

    const fields = (row) => ({
        CategoryNumber: row.CategoryNumber,
        CategoryName: row.CategoryName,
        SubCategoryNumber: row.SubCategoryNumber,
        SubCategoryName: row.SubCategoryName,
    });

    const transaction = await req.db.transaction();

    try {
        if (remove.length) {
            await SAPCategory.destroy({ where: { CategoryID: remove }, transaction });
        }

        for (const row of update) {
            await SAPCategory.update(fields(row), { where: { CategoryID: row.CategoryID }, transaction });
        }

        if (create.length) {
            await SAPCategory.bulkCreate(create.map(fields), { transaction });
        }

        await transaction.commit();

        return res.status(200).json({ success: true });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({ success: false, message: `Server Error - batchUpdateCategories - ${error.message}` });
    }
});
