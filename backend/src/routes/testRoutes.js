import express from 'express';
const router = express.Router();
import { getTests, createTest, updateTest, deleteTest } from '../controllers/testController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getTests)
    .post(protect, authorize('admin', 'lab_manager'), createTest);

router.route('/:id')
    .put(protect, authorize('admin', 'lab_manager'), updateTest)
    .delete(protect, authorize('admin', 'lab_manager'), deleteTest);

export default router;
