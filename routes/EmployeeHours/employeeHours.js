const express = require('express');


const { getAllPeople } = require('../../controllers/EmployeeHours/resources/people');
const { getAllJobs } = require('../../controllers/EmployeeHours/resources/jobs');
const { getAllCategories } = require('../../controllers/EmployeeHours/resources/categories')
const upload = require('../../middleware/fileUpload');
const { importInternalJobList } = require('../../controllers/EmployeeHours/imports/importData');
const { submitShopHours, getAllEntries, getEmployeeHourSubmissions } = require('../../controllers/EmployeeHours/shopHours/shopHours');
const { saveWorkingData, getWorkingData } = require('../../controllers/EmployeeHours/shopHours/workingData');
const { exportWorkingDataToExcel } = require('../../controllers/EmployeeHours/exportExcel/exportExcel');

const { userLogin, userRegister } = require('../../controllers/EmployeeHours/auth/auth');


const router = express.Router();

router
    .route('/auth/login')
    .post(userLogin)
    
router
    .route('/auth/register')
    .post(userRegister)

router
    .route('/people')
    .get(getAllPeople)

router
    .route('/jobs')
    .get(getAllJobs)

router
    .route('/categories')
    .get(getAllCategories)

router
    .route('/shop/entries')
    .get(getAllEntries)

router
    .route('/shop/submit')
    .post(submitShopHours)

router
    .route('/shop/working-data')
    .post(saveWorkingData)
    .get(getWorkingData)

router
    .route('/manager-verification/export-excel')
    .post(exportWorkingDataToExcel)

router
    .route('/shop/submissions/:peopleid')
    .get(getEmployeeHourSubmissions)

router
    .route('/import/internaljobs')
    .post(upload.single('file'), importInternalJobList)

module.exports = router;