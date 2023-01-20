const express =  require('express');

const {
    getAllUsers,
    createUser,
    deleteUser,
    updateUser
} = require('../../controllers/Users/users');

const router = express.Router();

router
    .route('/')
    .get(getAllUsers)
    .post(createUser)

router
    .route('/:id')
    .put(updateUser)
    .delete(deleteUser)

module.exports = router;