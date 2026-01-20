import express from 'express';
const router = express.Router();
import { registerPatient, getPatients, getPatientById } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/')
    .post(protect, registerPatient)
    .get(protect, getPatients);

router.route('/:id')
    .get(protect, getPatientById);

export default router;
