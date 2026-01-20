import { vi } from 'vitest';

process.env.JWT_SECRET = 'test_secret_key';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';

// Mock console to keep test output clean
/*
vi.stubGlobal('console', {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
});
*/
