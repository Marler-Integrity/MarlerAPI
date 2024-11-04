const multer = require('multer');

// Set up multer storage configuration
const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB (optional)
});

// Use `upload.single('file')` in the route where you want to handle single file uploads
module.exports = upload;