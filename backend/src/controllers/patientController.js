import Patient from '../models/Patient.js';

// Helper to generate Patient ID (simple counter or timestamp based for now)
const generatePatientId = async () => {
    // In production, use a counter collection. Here using timestamp + random
    return 'P' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
};

// @desc Register new patient
// @route POST /api/patients
// @access Private
export const registerPatient = async (req, res) => {
    try {
        const { name, age, gender, mobile, email, address, referringDoctor } = req.body;

        // Check if patient exists by mobile
        const patientExists = await Patient.findOne({ mobile });
        if (patientExists) {
            return res.status(400).json({
                message: 'Patient already exists with this mobile number',
                patient: patientExists
            });
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc Get all patients (with search and pagination)
// @route GET /api/patients
// @access Private
export const getPatients = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get patient by ID
// @route GET /api/patients/:id
// @access Private
export const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
