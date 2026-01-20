import express from 'express';
const router = express.Router();
import { getSettings, updateSettings, uploadLogo } from '../controllers/settingsController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';

router.route('/')
    .get(protect, getSettings)
    .put(protect, updateSettings);

router.post('/logo', protect, upload.single('logo'), uploadLogo);

export default router;
