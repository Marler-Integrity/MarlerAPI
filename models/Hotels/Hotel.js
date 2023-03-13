const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    employee: {
        type: String
    },
    checkIn: {
        type: Date
    },
    hotelName: {
        type: String
    },
    town: {
        type: String
    },
    numNights: {
        type: Number
    },
    rate: {
        type: Number
    },
    checkedOut: {
        type: Date
    },
    checkedOutEarly: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        default: new Date( Date.now() + (6.048e+8 * 8) ) //deletes in three weeks from day created
    }
});

module.exports = mongoose.model('Hotel', HotelSchema);