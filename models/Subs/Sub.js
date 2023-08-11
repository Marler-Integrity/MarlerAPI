const mongoose = require('mongoose');

const SubSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Please add date of Sub']
    },
    user: {
        type: String,
        required: [true, "Please add an username"]
    },
    subType: {
        type: String,
        required: [true, "Please add a sub type"]
    },
    hotel: {
        type: String,
        required: [true, "Please add a hotel name"]
    },
    town: {
        type: String,
        required:  [true, "Please add a town name"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    approved: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: new Date( Date.now() + (6.048e+8 * 3) ) //deletes in three weeks from day created
    }
});

module.exports = mongoose.model('Sub', SubSchema);

