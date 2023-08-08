const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    employee: {
        type: String,
        required: [true, "Please add employee's full name"]
    },
    checkIn: {
        type: Date,
        required: [true, "Please enter check-in date"]
    },
    checkOut: {
        type: Date,
        required: [true, "Please enter check-out date"]
    },
    hotelName: {
        type: String,
        require: [true, "Please enter hotel name"]
    },
    town: {
        type: String,
        require: [true, "Please enter town name"]
    },
    numNights: {
        type: Number,
        required: ["Please enter number of nights"]
    },
    rate: {
        type: Number,
        required: [true, "Please enter the rate"]
    },
    checkedOut: {
        type: Date
    },
    checkedOutEarly: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        // default: new Date( Date.now() + (6.048e+8 * 4) )  //expires at comes when approved - this time equates to 4 weeks
    }
});

module.exports = mongoose.model('Hotel', HotelSchema);