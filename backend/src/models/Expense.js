import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'],
        default: 'Cash'
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending'],
        default: 'Paid'
    },
    vendor: {
        type: String
    },
    invoiceNumber: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    remarks: {
        type: String
    },
    enteredBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
