import express from 'express';
const router = express.Router();
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getExpenses)
    .post(protect, createExpense);

router.route('/:id')
    .delete(protect, deleteExpense);

export default router;
