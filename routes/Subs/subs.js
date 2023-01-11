const express =  require('express');

const {
    getAllSubs,
    createSub,
    updateSub,
    deleteSub
} = require('../../controllers/Subs/subs');

const {
    getEmployeeNames,
    getEmployeeData,
    approveSubs
} = require('../../controllers/Subs/Admin/admin');

const router = express.Router();

router
    .route('/')
    .get(getAllSubs)
    .post(createSub)

router  
    .route('/:id')
    .put(updateSub)
    .delete(deleteSub)

router
    .route('/admin')
    .get(getEmployeeData)

router  
    .route('/admin/employees')
    .get(getEmployeeNames)

router
    .route('/admin/approve')
    .put(approveSubs)

module.exports = router;