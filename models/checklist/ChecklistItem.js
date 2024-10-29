const mongoose = require('mongoose');

const ChecklistItemSchema = new mongoose.Schema({
    Name: {
        type: String,
    },
    Who: {
        type: String,
    },
    Period: {
        type: String,
    },
    Key: {
        type: String,
    },
    '1st warn': {
        type: Number
    },
    'Next due': {
        type: String,
    },
    'Last Done': {
        type: String,
    },
    Description: {
        type: String,
    },
    tabName: {
        type: String,
    },
    company: {
        type: String,
    },
    editedBy: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
});

// module.exports = mongoose.model('ChecklistItem', ChecklistItemSchema);
module.exports = ChecklistItemSchema;