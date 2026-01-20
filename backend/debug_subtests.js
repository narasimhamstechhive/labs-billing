import mongoose from 'mongoose';
import TestResult from './src/models/TestResult.js';
import Sample from './src/models/Sample.js';
import Test from './src/models/Test.js';
import Patient from './src/models/Patient.js';
import Department from './src/models/Department.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const results = await TestResult.find({
            $or: [
                { subtests: { $exists: true, $not: { $size: 0 } } },
                { sample: { $exists: true } } // Check some recent ones too
            ]
        }).sort({ createdAt: -1 }).limit(5).populate('test');

        results.forEach(r => {
            console.log(`Sample ID: ${r.sample}, Test: ${r.test.testName}, Subtests: ${r.subtests?.length || 0}`);
            if (r.subtests?.length > 0) {
                console.log('  Subtest data:', JSON.stringify(r.subtests, null, 2));
            }
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
