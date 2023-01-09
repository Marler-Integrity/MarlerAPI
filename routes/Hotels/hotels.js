const express = require('express');

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
    .get(getAllHotels)
    .post(createHotel);

router  
    .route('/:id')
    .get(getHotel)
    .put(updateHotel)
    .delete(deleteHotel);

module.exports = router;
    