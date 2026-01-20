import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
    sample: { type: mongoose.Schema.Types.ObjectId, ref: 'Sample', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    resultValue: { type: String, required: true },
    unit: { type: String }, // Captured from Test at time of entry (snapshot)
    normalRange: { type: String }, // Captured snapshot
    abnormal: { type: Boolean, default: false },
    remarks: { type: String },
    subtests: [{
        testName: { type: String, required: true },
        resultValue: { type: String, required: true },
        unit: { type: String },
        normalRange: { type: String },
        abnormal: { type: Boolean, default: false }
    }],
    status: { type: String, enum: ['Pending', 'Entered', 'Approved', 'Rejected'], default: 'Entered' },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('TestResult', testResultSchema);
