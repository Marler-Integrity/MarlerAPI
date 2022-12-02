const express =  require('express');

const {
    getAllSubs,
    createSub,
    updateSub,
    deleteSub
} = require('../controllers/subs');

const router = express.Router();

router
    .route('/')
    .get(getAllSubs)
    .post(createSub)

router  
    .route('/:id')
    .put(updateSub)
    .delete(deleteSub)

module.exports = router;