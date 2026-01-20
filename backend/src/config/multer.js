import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Use memory storage for Vercel (serverless), disk storage for local development
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
    destination(req, file, cb) {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist (local only)
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage: isVercel ? memoryStorage : diskStorage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
