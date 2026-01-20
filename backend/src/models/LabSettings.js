import mongoose from 'mongoose';

const labSettingsSchema = new mongoose.Schema({
    labName: {
        type: String,
        required: [true, 'Please add a laboratory name'],
        trim: true,
        default: 'MediLab Laboratory'
    },
    businessName: {
        type: String,
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },
    termsAndConditions: {
        type: String,
        trim: true,
        default: '1. Reports are for clinical correlation only.\n2. In case of any disparity, please repeat the test.'
    }
}, {
    timestamps: true
});

export default mongoose.model('LabSettings', labSettingsSchema);
