const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({ storage });

module.exports = upload;