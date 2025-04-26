const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/webm" || file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only WEBM and MP4 videos are allowed."),
        false
      );
    }
  },
});
const fileUpload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'video/webm',
            'video/mp4',
            'text/javascript',
            'application/javascript',
            'text/html',
            'text/python',
            'text/x-python',
            'text/css',
            'application/json',
            'text/plain',
            'application/msword',
            'application/pdf',
            'image/jpeg',
            'image/png'
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only specified file types are allowed.'), false);
        }
    }
});

module.exports = {upload,fileUpload};