const express = require('express');
const deleteExpired = require('../../middleware/deleteExpired');

const {
    getAllHotels,
    getHotel,
    createHotel,
    deleteHotel,
    updateHotel,
    archiveHotels,
    folioReceived
} = require('../../controllers/Hotels/hotels');

const router = express.Router();

router  
    .route('/')
    .get(deleteExpired('Hotel'), getAllHotels)
    .post(createHotel);

router
    .route('/archive')
    .put(archiveHotels);

router
    .route('/folio/:id')
    .put(folioReceived);

router  
    .route('/:id')
    .get(getHotel)
    .put(updateHotel)
    .delete(deleteHotel);

module.exports = router;
    