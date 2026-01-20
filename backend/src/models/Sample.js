import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
    sampleId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    sampleType: { type: String, required: true }, // e.g., EDTA, Serum
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }], // Tests covered by this sample
    status: {
        type: String,
        enum: ['Pending', 'Collected', 'Processing', 'Completed', 'Approved', 'Delivered'],
        default: 'Pending'
    },
    collectionDate: { type: Date },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String }
}, { timestamps: true });

export default mongoose.model('Sample', sampleSchema);
