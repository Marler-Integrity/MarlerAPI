const mongoose = require('mongoose');

const ChecklistItemCompletedSchema = new mongoose.Schema({
    itemID: {
        type: mongoose.Schema.Types.ObjectId
    },
    completedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

module.exports = ChecklistItemCompletedSchema;
// module.exports = mongoose.model('ChecklistItemCompleted', ChecklistItemCompletedSchema)