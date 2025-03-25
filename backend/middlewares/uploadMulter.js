const multer = require("multer");
const path = require('path');
const fs = require('fs');
// const storage = multer.memoryStorage(); // Store files in memory for processing
// const upload = multer({ storage });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/videos/';
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });
  
module.exports = upload;