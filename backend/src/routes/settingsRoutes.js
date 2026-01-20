import express from 'express';
const router = express.Router();
import { getSettings, updateSettings, uploadLogo } from '../controllers/settingsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { storage } from '../config/cloudinary.js';
import multer from 'multer';
const upload = multer({ storage });

router.route('/')
    .get(protect, getSettings)
    .put(protect, updateSettings);

router.post('/logo', protect, (req, res, next) => {
    upload.single('logo')(req, res, (err) => {
        if (err) {
            // Return 400 for any upload error (e.g. file type, size limit)
            return res.status(400).json({ message: err.message || err });
        }
        next();
    });
}, uploadLogo);

export default router;
