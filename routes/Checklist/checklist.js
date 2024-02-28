const express = require('express');
const {
    getAllChecklistItems, 
    updateChecklistItem, 
    updateMultipleItems, 
    createNewChecklistItem, 
    deleteChecklistItem, 
    deleteArrayOfItems
} = require('../../controllers/Checklist/checklist');

const router = express.Router();

router
    .route('/')
    .get(getAllChecklistItems)
    .post(createNewChecklistItem)

router
    .route('/tabnames')
    .put(updateMultipleItems)

router
    .route('/tabremoved')
    .delete(deleteArrayOfItems)

router
    .route('/:id')
    .put(updateChecklistItem)
    .delete(deleteChecklistItem)

module.exports = router;