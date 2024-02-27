const express = require('express');
const {getAllChecklistItems, updateChecklistItem, updateMultipleItems} = require('../../controllers/Checklist/checklist');

const router = express.Router();

router
    .route('/')
    .get(getAllChecklistItems)

router
    .route('/tabnames')
    .put(updateMultipleItems)

router
    .route('/:id')
    .put(updateChecklistItem)

module.exports = router;