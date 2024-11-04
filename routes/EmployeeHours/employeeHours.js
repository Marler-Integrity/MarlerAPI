const express = require('express');
const { userLogin } = require('../../controllers/EmployeeHours/auth/auth');
const { getAllPeople } = require('../../controllers/EmployeeHours/resources/people');
const { getAllJobs } = require('../../controllers/EmployeeHours/resources/jobs');
const upload = require('../../middleware/fileUpload');
const { importInternalJobList } = require('../../controllers/EmployeeHours/imports/importData');

const router = express.Router();

router
    .route('/auth/login')
    .post(userLogin)

router
    .route('/people')
    .get(getAllPeople)

router
    .route('/jobs')
    .get(getAllJobs)

router
    .route('/import/internaljobs')
    .post(upload.single('file'), importInternalJobList)

module.exports = router;