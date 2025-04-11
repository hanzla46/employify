const multer = require("multer");

const fileStorage = multer.memoryStorage();
const fileUpload = multer({
    storage: fileStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common text-based file types and videos (or whatever you need)
        const allowedMimeTypes = [
            'video/webm',
            'video/mp4',
            'text/javascript',
            'application/javascript',
            'text/html',
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

module.exports = fileUpload;