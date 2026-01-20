import express from 'express';
const router = express.Router();
import { createInvoice, getInvoices, printInvoice, getBillingStats, getDailyStats, deleteInvoice } from '../controllers/billingController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/')
    .get(protect, getInvoices);

router.get('/stats', protect, getBillingStats);
router.get('/daily-stats', protect, getDailyStats);

router.route('/create')
    .post(protect, createInvoice);

router.get('/print/:id', protect, printInvoice);
router.delete('/:id', protect, deleteInvoice);

export default router;
