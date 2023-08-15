//middleware and utils
const asyncHandler = require('../../middleware/async');
const ErrorResponse = require('../../utils/ErrorResponse');

const Hotel = require('../../models/Hotels/Hotel');

//@desc     Get all Hotel Documents
//@route    GET /api/v1/hotels/
//@access   Public
exports.getAllHotels = asyncHandler(async(req, res, next) => {
    let hotelDocs;
    if(req.query.user && req.query.user !== ''){
        hotelDocs = await Hotel.find({employee: req.query.user})
    } else {
        hotelDocs = await Hotel.find();
    }

    res.status(200).json({
        success: true,
        data: hotelDocs
    })
});

//@desc     Get a Hotel by ID
//@route    GET /api/v1/hotels/[id]
//@access   Public
exports.getHotel = asyncHandler(async(req, res, next) => {
    let hotelDoc = await Hotel.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: hotelDoc
    })
});

//@desc     Create a new hotel booking
//@route    POST /api/v1/hotels/
//@access   Public
exports.createHotel = asyncHandler(async(req, res, next) => {
    let hotel = await Hotel.create(req.body);

    res.status(200).json({
        success: true,
        data: hotel
    })
});

//@desc     Delete a hotel booking
//@route    DELETE /api/v1/hotels/[id]
//@access   Public
exports.deleteHotel = asyncHandler(async(req, res, next) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);    
    } catch (error) {
        return next(new ErrorResponse(`Error deleting document with ID ${req.params.id}`, 500));
    }

    res.status(200).json({
        success: true,
        data: {
            msg: `Document with ID ${req.params.id} successfully deleted`
        }
    })
});

//@desc     Update a hotel booking
//@route    PUT /api/v1/hotels/[id]
//@access   Public
exports.updateHotel = asyncHandler(async(req, res, next) => {
    let hotelDoc = await Hotel.findByIdAndUpdate(req.params.id, req.body, {new: true});

    if(!hotelDoc) {
        return next(new ErrorResponse(`Cannot find document with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: hotelDoc
    })
});

//@desc     Archive Hotel Bookings
//@route    GET /api/v1/hotels/archive
//@access   Private - Teams Authentication
exports.archiveHotels = asyncHandler(async (req, res, next) => {
    try {
        const updatePromises = req.body.map(async (hotelId) => {
            const hotel = await Hotel.findById(hotelId);
            const hotelObject = hotel.toObject();
            // If the archived field doesn't exist, set it to true; otherwise, toggle its value
            const newArchivedStatus = hotelObject.hasOwnProperty('archived') ? !hotel.archived : true;
        
            return Hotel.findByIdAndUpdate(hotelId, { archived: newArchivedStatus });
        });
        
        // Wait for all updates to complete
        await Promise.all(updatePromises);
        
        // Send response
        res.status(200).json({
            success: true,
            msg: 'Hotels have been archived'
        });
    } catch (error) {
        return next(new ErrorResponse(500, `Server Error - archiveHotels`))
    }
});