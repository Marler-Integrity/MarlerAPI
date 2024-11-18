const express = require('express');
const { userLogin } = require('../../controllers/EmployeeHours/auth/auth');
const { getAllPeople } = require('../../controllers/EmployeeHours/resources/people');
const { getAllJobs } = require('../../controllers/EmployeeHours/resources/jobs');
const upload = require('../../middleware/fileUpload');
const { importInternalJobList } = require('../../controllers/EmployeeHours/imports/importData');
const { submitShopHours, getEmployeeHourSubmissions, updateSubmissions, deleteEntry } = require('../../controllers/EmployeeHours/shopHours/shopHours');

const { userLogin, userRegister, fieldUserRegister } = require('../../controllers/EmployeeHours/auth/auth');


const router = express.Router();

router
    .route('/auth/login')
    .post(userLogin)

router
    .route('/auth/register/field')
    .post(fieldUserRegister)

router
    .route('/people')
    .get(getAllPeople)

router
    .route('/jobs')
    .get(getAllJobs)

router
    .route('/shop/submit')
    .post(submitShopHours)

router
    .route('/shop/submissions')
    .post(updateSubmissions)

router
    .route('/shop/submissions/delete/:srdid')
    .delete(deleteEntry)
     
router
    .route('/shop/submissions/:peopleid')
    .get(getEmployeeHourSubmissions)

router
    .route('/import/internaljobs')
    .post(upload.single('file'), importInternalJobList)

module.exports = router;