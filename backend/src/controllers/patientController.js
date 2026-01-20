import Patient from '../models/Patient.js';
import asyncHandler from 'express-async-handler';

// Helper to generate Patient ID (simple counter or timestamp based for now)
const generatePatientId = async () => {
    // In production, use a counter collection. Here using timestamp + random
    return 'P' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
};

// @desc Register new patient
// @route POST /api/patients
// @access Private
export const registerPatient = asyncHandler(async (req, res) => {
    const { name, age, gender, mobile, email, address, referringDoctor } = req.body;

    // Check if patient exists by mobile
    const patientExists = await Patient.findOne({ mobile });
    if (patientExists) {
        res.status(400);
        throw new Error('Patient already exists with this mobile number');
    }

    const patientId = await generatePatientId();

    const patient = await Patient.create({
        patientId,
        name,
        age,
        gender,
        mobile,
        email,
        address,
        referringDoctor
    });

    res.status(201).json(patient);
});

// @desc Get all patients (with search and pagination)
// @route GET /api/patients
// @access Private
export const getPatients = asyncHandler(async (req, res) => {
    const { date, from, to, keyword, page = 1, limit = 10 } = req.query;
    const query = keyword ? {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { mobile: { $regex: keyword, $options: 'i' } },
            { patientId: { $regex: keyword, $options: 'i' } }
        ]
    } : {};

    if (from && to) {
        query.createdAt = {
            $gte: new Date(from),
            $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
        };
    } else if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const patients = await Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    res.json({
        patients,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc Get patient by ID
// @route GET /api/patients/:id
// @access Private
export const getPatientById = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
        res.status(404);
        throw new Error('Patient not found');
    }
    res.json(patient);
});

// @desc Delete patient
// @route DELETE /api/patients/:id
// @access Private
export const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (patient) {
        // Optional: Delete associated invoices and samples? 
        // For now, let's just delete the patient or mark as inactive.
        // The user asked to "delete", so we'll delete.
        await patient.deleteOne();
        res.json({ message: 'Patient removed' });
    } else {
        res.status(404);
        throw new Error('Patient not found');
    }
});
