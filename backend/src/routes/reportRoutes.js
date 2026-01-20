import express from 'express';
const router = express.Router();
import { getPendingResults, submitResults, approveResults, printReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

router.get('/pending', protect, getPendingResults);
router.post('/submit', protect, submitResults);
router.put('/approve/:sampleId', protect, authorize('admin', 'pathologist'), approveResults);
router.get('/print/:sampleId', protect, printReport);

export default router;
