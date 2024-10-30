const express = require('express');
const { userLogin } = require('../../controllers/EmployeeHours/auth/auth');

const router = express.Router();

router
    .route('/auth/login')
    .post(userLogin)

module.exports = router;