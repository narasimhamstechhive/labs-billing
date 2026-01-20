import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    testName: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    sampleType: { type: String, required: true }, // e.g. blood, urine
    unit: { type: String },
    method: { type: String },
    price: { type: Number, required: true },
    tat: { type: String }, // Turnaround time
    normalRanges: {
        male: { min: Number, max: Number },
        female: { min: Number, max: Number },
        child: { min: Number, max: Number },
        general: { type: String } // For non-numeric or descriptive ranges
    },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Test', testSchema);
