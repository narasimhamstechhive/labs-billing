import express from 'express';
const router = express.Router();
import { getSamples, updateSampleStatus, deleteSample } from '../controllers/sampleController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getSamples);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteSample);

router.route('/:id/status')
    .put(protect, updateSampleStatus);

export default router;
