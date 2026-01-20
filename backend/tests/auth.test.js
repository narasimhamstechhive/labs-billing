import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

// Mock User Model
vi.mock('../src/models/User.js', () => {
    return {
        default: {
            findOne: vi.fn(),
            create: vi.fn(),
            findById: vi.fn(),
        }
    };
});

describe('Auth API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {
        it('should return 401 for invalid credentials (user not found)', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'wrongpassword' });

            if (res.status !== 401) {
                console.log('Error Response 401 test:', res.body);
            }
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 401 for invalid credentials (wrong password)', async () => {
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@test.com',
                role: 'Admin',
                matchPassword: vi.fn().mockResolvedValue(false),
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'wrongpassword' });

            if (res.status !== 401) {
                console.log('Error Response wrong pass test:', res.body);
            }
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 200 and token for valid credentials', async () => {
            const mockUser = {
                _id: '123',
                name: 'Test User',
                email: 'test@test.com',
                role: 'Admin',
                matchPassword: vi.fn().mockResolvedValue(true),
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'password123' });

            if (res.status !== 200) {
                console.log('Error Response 200 test:', res.body);
            }
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.name).toBe('Test User');
        });
    });
});
