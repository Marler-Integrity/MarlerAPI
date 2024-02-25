const express = require('express');
const {getAllChecklistItems} = require('../../controllers/Checklist/checklist');

const router = express.Router();

router
    .route('/')
    .get(getAllChecklistItems)

module.exports = router;