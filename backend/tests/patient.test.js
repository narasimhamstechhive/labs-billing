import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Patient from '../src/models/Patient.js';

// Mock authMiddleware
vi.mock('../src/middlewares/authMiddleware.js', () => ({
    protect: vi.fn((req, res, next) => {
        req.user = { _id: 'mock-user-id' };
        next();
    }),
    authorize: vi.fn(() => (req, res, next) => next())
}));

// Mock Patient Model
vi.mock('../src/models/Patient.js', () => {
    return {
        default: {
            findOne: vi.fn(),
            create: vi.fn(),
            find: vi.fn(),
            countDocuments: vi.fn(),
            findById: vi.fn(),
        }
    };
});

describe('Patient API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/patients', () => {
        it('should register a new patient successfully', async () => {
            const patientData = {
                name: 'John Doe',
                age: '30',
                gender: 'Male',
                mobile: '1234567890',
                email: 'john@example.com'
            };

            Patient.findOne.mockResolvedValue(null);
            Patient.create.mockResolvedValue({ _id: 'mockid', ...patientData, patientId: 'P123456' });

            const res = await request(app)
                .post('/api/patients')
                .send(patientData);

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('John Doe');
            expect(res.body.patientId).toBeDefined();
        });

        it('should return 400 if patient already exists', async () => {
            const patientData = { mobile: '1234567890' };
            Patient.findOne.mockResolvedValue({ _id: 'existingid', mobile: '1234567890' });

            const res = await request(app)
                .post('/api/patients')
                .send(patientData);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Patient already exists with this mobile number');
        });
    });

    describe('GET /api/patients', () => {
        it('should return a list of patients', async () => {
            const mockPatients = [
                { _id: '1', name: 'Patient 1' },
                { _id: '2', name: 'Patient 2' }
            ];

            // Mocking chainable methods
            const mockFind = {
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(mockPatients)
            };
            Patient.find.mockReturnValue(mockFind);
            Patient.countDocuments.mockResolvedValue(2);

            const res = await request(app).get('/api/patients');

            expect(res.status).toBe(200);
            expect(res.body.patients).toHaveLength(2);
            expect(res.body.total).toBe(2);
        });
    });
});
