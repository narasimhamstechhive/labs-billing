import express from 'express';
const router = express.Router();
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getAnalytics);

export default router;
