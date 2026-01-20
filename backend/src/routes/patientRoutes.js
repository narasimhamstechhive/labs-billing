import express from 'express';
const router = express.Router();
import { registerPatient, getPatients, getPatientById, deletePatient } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';
// import { validatePatientRegistration, handleValidationErrors } from '../middlewares/validationMiddleware.js';

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Register a new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - gender
 *               - mobile
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               mobile:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               referringDoctor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered successfully
 *       400:
 *         description: Validation error or patient already exists
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of patients
 */
router.route('/')
    .post(protect, registerPatient)
    .get(protect, getPatients);

router.route('/:id')
    .get(protect, getPatientById)
    .delete(protect, deletePatient);

export default router;
