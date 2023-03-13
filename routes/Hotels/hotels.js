const express = require('express');
const deleteExpired = require('../../middleware/deleteExpired');
const Hotel = require('../../models/Hotels/Hotel');

const {
    getAllHotels,
    getHotel,
    createHotel,
    deleteHotel,
    updateHotel
} = require('../../controllers/Hotels/hotels');

const router = express.Router();

router  
    .route('/')
    .get(deleteExpired(Hotel), getAllHotels)
    .post(createHotel);

router  
    .route('/:id')
    .get(getHotel)
    .put(updateHotel)
    .delete(deleteHotel);

module.exports = router;
    