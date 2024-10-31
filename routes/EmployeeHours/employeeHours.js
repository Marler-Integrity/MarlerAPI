const express = require('express');
const { userLogin, userRegister } = require('../../controllers/EmployeeHours/auth/auth');

const router = express.Router();

router
    .route('/auth/login')
    .post(userLogin)
    
router
    .route('/auth/register')
    .post(userRegister)

module.exports = router;