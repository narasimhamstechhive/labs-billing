import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true }, // UHID or Lab ID
    name: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    mobile: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    referringDoctor: { type: String },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample' }] // Link to visits/samples
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
