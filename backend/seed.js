import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import User from './src/models/User.js';
import Department from './src/models/Department.js';
import Test from './src/models/Test.js';
import Patient from './src/models/Patient.js';

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Department.deleteMany({});
        await Test.deleteMany({});
        await Patient.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Users one by one (to trigger pre-save hooks properly)
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@medilab.com',
            password: 'admin123',
            role: 'admin',
            mobile: '9876543210'
        });
        await adminUser.save();

        const pathologistUser = new User({
            name: 'Dr. Sarah Pathologist',
            email: 'pathologist@medilab.com',
            password: 'path123',
            role: 'pathologist',
            mobile: '9876543211'
        });
        await pathologistUser.save();

        const technicianUser = new User({
            name: 'John Technician',
            email: 'tech@medilab.com',
            password: 'tech123',
            role: 'technician',
            mobile: '9876543212'
        });
        await technicianUser.save();

        const managerUser = new User({
            name: 'Lab Manager',
            email: 'manager@medilab.com',
            password: 'manager123',
            role: 'lab_manager',
            mobile: '9876543213'
        });
        await managerUser.save();

        console.log('👥 Created 4 users');

        // Create Departments
        const departments = await Department.create([
            { name: 'Pathology', description: 'General pathology tests' },
            { name: 'Biochemistry', description: 'Blood chemistry and metabolic tests' },
            { name: 'Hematology', description: 'Blood cell analysis' },
            { name: 'Microbiology', description: 'Infection and culture tests' },
            { name: 'Immunology', description: 'Immune system tests' }
        ]);
        console.log('🏥 Created 5 departments');

        // Create Tests
        const tests = await Test.create([
            {
                testName: 'Complete Blood Count (CBC)',
                department: departments[2]._id,
                sampleType: 'EDTA Blood',
                unit: 'cells/μL',
                method: 'Automated Analyzer',
                price: 300,
                tat: '2 hours',
                normalRanges: {
                    male: { min: 4500, max: 11000 },
                    female: { min: 4000, max: 10000 },
                    general: '4000-11000 cells/μL'
                }
            },
            {
                testName: 'Lipid Profile',
                department: departments[1]._id,
                sampleType: 'Serum',
                unit: 'mg/dL',
                method: 'Enzymatic',
                price: 500,
                tat: '4 hours',
                normalRanges: {
                    general: 'Total Cholesterol < 200 mg/dL'
                }
            },
            {
                testName: 'Blood Sugar (Fasting)',
                department: departments[1]._id,
                sampleType: 'Plasma',
                unit: 'mg/dL',
                method: 'Glucose Oxidase',
                price: 150,
                tat: '1 hour',
                normalRanges: {
                    general: '70-100 mg/dL'
                }
            },
            {
                testName: 'Liver Function Test (LFT)',
                department: departments[1]._id,
                sampleType: 'Serum',
                unit: 'U/L',
                method: 'Spectrophotometry',
                price: 600,
                tat: '6 hours',
                normalRanges: {
                    general: 'ALT: 7-56 U/L, AST: 10-40 U/L'
                }
            },
            {
                testName: 'Kidney Function Test (KFT)',
                department: departments[1]._id,
                sampleType: 'Serum',
                unit: 'mg/dL',
                method: 'Jaffe Method',
                price: 550,
                tat: '6 hours',
                normalRanges: {
                    general: 'Creatinine: 0.6-1.2 mg/dL'
                }
            },
            {
                testName: 'Thyroid Profile (T3, T4, TSH)',
                department: departments[4]._id,
                sampleType: 'Serum',
                unit: 'μIU/mL',
                method: 'ELISA',
                price: 800,
                tat: '24 hours',
                normalRanges: {
                    general: 'TSH: 0.4-4.0 μIU/mL'
                }
            },
            {
                testName: 'Urine Routine',
                department: departments[0]._id,
                sampleType: 'Urine',
                unit: 'N/A',
                method: 'Microscopy',
                price: 200,
                tat: '2 hours',
                normalRanges: {
                    general: 'pH: 4.5-8.0, No protein, No glucose'
                }
            },
            {
                testName: 'Hemoglobin (Hb)',
                department: departments[2]._id,
                sampleType: 'EDTA Blood',
                unit: 'g/dL',
                method: 'Cyanmethemoglobin',
                price: 100,
                tat: '1 hour',
                normalRanges: {
                    male: { min: 13, max: 17 },
                    female: { min: 12, max: 15 },
                    general: 'Male: 13-17 g/dL, Female: 12-15 g/dL'
                }
            }
        ]);
        console.log('🧪 Created 8 tests');

        // Create Sample Patients
        const patients = await Patient.create([
            {
                patientId: 'P100001',
                name: 'Rajesh Kumar',
                age: 45,
                gender: 'Male',
                mobile: '9123456789',
                email: 'rajesh@example.com',
                address: '123 MG Road, Bangalore',
                referringDoctor: 'Dr. Sharma'
            },
            {
                patientId: 'P100002',
                name: 'Priya Singh',
                age: 32,
                gender: 'Female',
                mobile: '9123456790',
                email: 'priya@example.com',
                address: '456 Park Street, Mumbai',
                referringDoctor: 'Dr. Patel'
            },
            {
                patientId: 'P100003',
                name: 'Amit Verma',
                age: 28,
                gender: 'Male',
                mobile: '9123456791',
                address: '789 Lake View, Delhi',
                referringDoctor: 'Dr. Gupta'
            }
        ]);
        console.log('👤 Created 3 sample patients');

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📋 LOGIN CREDENTIALS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 Admin:');
        console.log('   Email: admin@medilab.com');
        console.log('   Password: admin123');
        console.log('');
        console.log('🔐 Pathologist:');
        console.log('   Email: pathologist@medilab.com');
        console.log('   Password: path123');
        console.log('');
        console.log('🔐 Technician:');
        console.log('   Email: tech@medilab.com');
        console.log('   Password: tech123');
        console.log('');
        console.log('🔐 Lab Manager:');
        console.log('   Email: manager@medilab.com');
        console.log('   Password: manager123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
