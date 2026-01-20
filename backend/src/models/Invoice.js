import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceIds: { type: String, required: true, unique: true }, // Auto-generated
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    profit: { type: Number, default: 0 }, // Track overpayment amount
    status: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], default: 'Unpaid' },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Mixed'], default: 'Cash' },
    payments: [{
        mode: { type: String, enum: ['Cash', 'UPI', 'Card'], required: true },
        amount: { type: Number, required: true }
    }],
    invoiceDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
