import express from 'express';
const router = express.Router();
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getDepartments)
    .post(protect, authorize('admin', 'lab_manager'), createDepartment);

router.route('/:id')
    .put(protect, authorize('admin', 'lab_manager'), updateDepartment)
    .delete(protect, authorize('admin', 'lab_manager'), deleteDepartment);

export default router;
