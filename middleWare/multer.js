// multerConfig.js

const multer = require('multer');

// Set up multer storage configuration
const storage = multer.memoryStorage(); // Files will be stored in memory

// Set up multer upload middleware for a single file
const singleUpload = multer({ storage }).single('file');

// Set up multer upload middleware for multiple files (up to 10 files)
const multipleUpload = multer({ storage }).array('files', 10); // "files" is the form field name, max 10 files

// Export the upload configurations
module.exports = {
  singleUpload,
  multipleUpload
};
