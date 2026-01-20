import Invoice from '../models/Invoice.js';
import Sample from '../models/Sample.js';
import Test from '../models/Test.js';
import Patient from '../models/Patient.js';
import LabSettings from '../models/LabSettings.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import asyncHandler from 'express-async-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate Invoice ID
const generateInvoiceId = () => 'INV' + Date.now().toString().slice(-6);
const generateSampleId = () => 'SMP' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

// @desc Create Invoice (and Samples)
// @route POST /api/billing/create
// @access Private
export const createInvoice = asyncHandler(async (req, res) => {
    const { patientId, tests, discount, paidAmount, paymentMode, payments } = req.body;

    // Calculate Totals
    // Fetch tests to get prices and sample types
    const testDetails = await Test.find({ _id: { $in: tests } });

    if (testDetails.length !== tests.length) {
        res.status(400);
        throw new Error('One or more tests not found');
    }

    const totalAmount = testDetails.reduce((acc, test) => acc + test.price, 0);
    const finalAmount = totalAmount - (discount || 0);

    // Ensure no negative balance
    const balance = Math.max(0, finalAmount - (paidAmount || 0));

    // Any extra payment is profit
    const profit = Math.max(0, (paidAmount || 0) - finalAmount);

    const status = balance <= 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid');

    // Handle payments array for split payment
    let invoicePayments = [];
    if (payments && payments.length > 0) {
        invoicePayments = payments;
    } else if (paymentMode && paidAmount > 0) {
        invoicePayments = [{ mode: paymentMode, amount: paidAmount }];
    }

    const invoice = await Invoice.create({
        invoiceIds: generateInvoiceId(),
        patient: patientId,
        tests,
        totalAmount,
        discount,
        finalAmount,
        paidAmount,
        balance,
        profit,
        status,
        paymentMode: payments && payments.length > 1 ? 'Mixed' : (paymentMode || 'Cash'),
        payments: invoicePayments,
        createdBy: req.user._id
    });

    // Create a single Sample for the entire invoice (grouping all tests)
    const sampleTypes = [...new Set(testDetails.map(t => t.sampleType || 'Other'))];
    const combinedSampleType = sampleTypes.join(', ');

    const sampleId = 'SMP-G-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);

    const newSample = await Sample.create({
        sampleId: sampleId,
        patient: patientId,
        invoice: invoice._id,
        sampleType: combinedSampleType,
        tests: tests, // Array of all test IDs
        status: 'Pending'
    });

    res.status(201).json(invoice);
});

// @desc Get All Invoices (with pagination)
// @route GET /api/billing
// @access Private
export const getInvoices = asyncHandler(async (req, res) => {
    const { from, to, patientId, keyword, page = 1, limit = 10 } = req.query;
    let query = {};

    // Support both patientId (ObjectId) and keyword (text search)
    if (patientId) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(patientId)) {
            query.patient = patientId;
        } else {
            // If not valid ObjectId, treat as keyword and search by patient name/mobile
            const patients = await Patient.find({
                $or: [
                    { name: { $regex: patientId, $options: 'i' } },
                    { mobile: { $regex: patientId, $options: 'i' } }
                ]
            }).select('_id');
            const patientIds = patients.map(p => p._id);
            if (patientIds.length > 0) {
                query.patient = { $in: patientIds };
            } else {
                // No matching patients, return empty result
                res.json({
                    invoices: [],
                    page: Number(page),
                    pages: 0,
                    total: 0
                });
                return;
            }
        }
    }

    // Support keyword search (alternative to patientId)
    if (keyword && !patientId) {
        const patients = await Patient.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { mobile: { $regex: keyword, $options: 'i' } }
            ]
        }).select('_id');
        const patientIds = patients.map(p => p._id);
        if (patientIds.length > 0) {
            query.patient = { $in: patientIds };
        } else {
            res.json({
                invoices: [],
                page: Number(page),
                pages: 0,
                total: 0
            });
            return;
        }
    }

    if (from && to) {
        query.createdAt = {
            $gte: new Date(from),
            $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
        };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const invoices = await Invoice.find(query)
        .populate('patient', 'name mobile patientId')
        .populate('tests', 'testName price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    const total = await Invoice.countDocuments(query);

    res.json({
        invoices,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc Get Billing Stats
// @route GET /api/billing/stats
// @access Private
export const getBillingStats = asyncHandler(async (req, res) => {
    const { date, from, to } = req.query;
    let matchStage = {};

    if (from && to) {
        matchStage.createdAt = {
            $gte: new Date(from),
            $lte: new Date(to)
        };
    } else if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        matchStage.createdAt = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const stats = await Invoice.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$paidAmount" },
                // Dynamic Profit: Sum of (Paid - Final) only if Paid > Final
                totalProfit: {
                    $sum: {
                        $max: [0, { $subtract: ["$paidAmount", "$finalAmount"] }]
                    }
                },
                totalLoss: { $sum: "$discount" }
            }
        }
    ]);

    const result = stats[0] || { totalRevenue: 0, totalProfit: 0, totalLoss: 0 };
    // Net Earnings = Profit (Overpayment) - Loss (Discount) as per user requirement
    const netEarnings = result.totalProfit - result.totalLoss;

    res.json({
        ...result,
        netEarnings
    });
});

// @desc Get Daily Stats for Chart (last 7 days)
// @route GET /api/billing/daily-stats
// @access Private
export const getDailyStats = asyncHandler(async (req, res) => {
    const { date, from, to } = req.query;
    let matchStage = {};

    if (from && to) {
        matchStage.createdAt = {
            $gte: new Date(from),
            $lte: new Date(to)
        };
    } else if (date) {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        matchStage.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    } else {
        matchStage.createdAt = {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7))
        };
    }

    const stats = await Invoice.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$paidAmount" },
                profit: {
                    $sum: {
                        $max: [0, { $subtract: ["$paidAmount", "$finalAmount"] }]
                    }
                },
                loss: { $sum: "$discount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    res.json(stats);
});

// @desc Print Invoice HTML
// @route GET /api/billing/print/:id
// @access Private
export const printInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(400);
        throw new Error('Invoice ID required');
    }

    // Support both MongoDB _id and human-readable invoiceIds
    let invoice;
    if (mongoose.Types.ObjectId.isValid(id)) {
        // Try MongoDB _id first
        invoice = await Invoice.findById(id).populate('patient').populate('tests');
    }

    // If not found by _id or not a valid ObjectId, try invoiceIds
    if (!invoice) {
        invoice = await Invoice.findOne({ invoiceIds: id }).populate('patient').populate('tests');
    }

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found in database');
    }

    if (!invoice.patient) {
        res.status(500);
        throw new Error('Invoice data incomplete: patient information missing');
    }

    if (!invoice.tests || invoice.tests.length === 0) {
        res.status(500);
        throw new Error('Invoice data incomplete: no tests found');
    }

    // Fetch Lab Settings
    let settings = await LabSettings.findOne();
    if (!settings) {
        settings = {
            labName: 'MediLab Diagnostic Center',
            address: '123 Health Street, Medicity',
            mobile: '0000000000',
            email: '',
            gstNumber: '',
            termsAndConditions: '1. Reports are for clinical correlation only.'
        };
    }

    // Read HTML template
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
    let templatePath;

    if (isVercel) {
        templatePath = path.join(process.cwd(), 'src', 'templates', 'invoice.html');
    } else {
        templatePath = path.join(__dirname, '..', 'templates', 'invoice.html');
    }

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
        const altPath = path.join(process.cwd(), 'backend', 'src', 'templates', 'invoice.html');
        if (fs.existsSync(altPath)) {
            templatePath = altPath;
        } else {
            res.status(500);
            throw new Error('Invoice template not found');
        }
    }

    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    if (!htmlTemplate) {
        res.status(500);
        throw new Error('Invoice template is empty');
    }

    // Prepare logo URL
    let logoHtml = '';
    if (settings.logo) {
        if (settings.logo.startsWith('data:image') || settings.logo.startsWith('http')) {
            // Base64 or Cloudinary URL
            logoHtml = `<img src="${settings.logo}" alt="Lab Logo" style="max-width: 100px; max-height: 100px;">`;
        } else {
            // Local relative path
            const baseUrl = req.protocol + '://' + req.get('host');
            const logoUrl = baseUrl + settings.logo;
            logoHtml = `<img src="${logoUrl}" alt="Lab Logo" style="max-width: 100px; max-height: 100px;">`;
        }
    }

    // Format date
    const invoiceDate = invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    const statusColor = '#000';
    const emailHtml = settings.email ? ` | Email: ${settings.email}` : '';
    const gstHtml = settings.gstNumber ? `<div class="lab-contact">GST: ${settings.gstNumber}</div>` : '';

    const referringDoctorHtml = invoice.patient?.referringDoctor
        ? `<div class="detail-row">
            <span class="detail-label">Ref. Doctor:</span>
            <span class="detail-value">${invoice.patient.referringDoctor}</span>
        </div>`
        : '';

    // Format tests for template
    let testsRows = '';
    if (invoice.tests && invoice.tests.length > 0) {
        invoice.tests.forEach((test, index) => {
            testsRows += `<tr>
                <td>${index + 1}</td>
                <td>${test.testName || 'Unknown Test'}</td>
                <td>₹${(test.price || 0).toFixed(2)}</td>
            </tr>`;
        });
    } else {
        testsRows = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #999;">No tests selected.</td></tr>';
    }

    const discountRow = invoice.discount > 0
        ? `<div class="summary-row">
            <span class="summary-label">Discount:</span>
            <span class="summary-value">- ₹${(invoice.discount || 0).toFixed(2)}</span>
        </div>`
        : '';

    const balanceRow = invoice.balance > 0
        ? `<div class="summary-row">
            <span class="summary-label">Balance:</span>
            <span class="summary-value">₹${(invoice.balance || 0).toFixed(2)}</span>
        </div>`
        : '';

    const paymentStatusHtml = invoice.balance > 0
        ? `<div style="font-weight: bold;">
            <span class="label">Outstanding:</span>
            <span>₹${(invoice.balance || 0).toFixed(2)} (Pending Payment)</span>
        </div>`
        : `<div style="font-weight: bold;">
            <span class="label">Payment Status:</span>
            <span>Fully Paid</span>
        </div>`;

    const termsHtml = settings.termsAndConditions
        ? `<div class="terms-section">
            <h4>Terms & Conditions</h4>
            <p>${settings.termsAndConditions.replace(/\n/g, '<br>')}</p>
        </div>`
        : '';

    // Replace template variables
    htmlTemplate = htmlTemplate.replace(/\{\{LOGO_HTML\}\}/g, logoHtml);
    htmlTemplate = htmlTemplate.replace(/\{\{LAB_NAME\}\}/g, settings.labName || '');
    htmlTemplate = htmlTemplate.replace(/\{\{ADDRESS\}\}/g, settings.address || '');
    htmlTemplate = htmlTemplate.replace(/\{\{MOBILE\}\}/g, settings.mobile || '');
    htmlTemplate = htmlTemplate.replace(/\{\{EMAIL_HTML\}\}/g, emailHtml);
    htmlTemplate = htmlTemplate.replace(/\{\{GST_HTML\}\}/g, gstHtml);

    htmlTemplate = htmlTemplate.replace(/\{\{INVOICE_ID\}\}/g, invoice.invoiceIds || 'N/A');
    htmlTemplate = htmlTemplate.replace(/\{\{INVOICE_DATE\}\}/g, invoiceDate);
    htmlTemplate = htmlTemplate.replace(/\{\{PAYMENT_MODE\}\}/g, invoice.paymentMode || 'Cash');
    htmlTemplate = htmlTemplate.replace(/\{\{STATUS\}\}/g, invoice.status || 'Unpaid');
    htmlTemplate = htmlTemplate.replace(/\{\{STATUS_COLOR\}\}/g, statusColor);

    htmlTemplate = htmlTemplate.replace(/\{\{PATIENT_NAME\}\}/g, invoice.patient?.name || 'N/A');
    htmlTemplate = htmlTemplate.replace(/\{\{PATIENT_AGE\}\}/g, invoice.patient?.age || 'N/A');
    htmlTemplate = htmlTemplate.replace(/\{\{PATIENT_GENDER\}\}/g, invoice.patient?.gender || 'N/A');
    htmlTemplate = htmlTemplate.replace(/\{\{PATIENT_MOBILE\}\}/g, invoice.patient?.mobile || 'N/A');
    htmlTemplate = htmlTemplate.replace(/\{\{REFERRING_DOCTOR_HTML\}\}/g, referringDoctorHtml);

    htmlTemplate = htmlTemplate.replace(/\{\{TESTS_ROWS\}\}/g, testsRows);

    htmlTemplate = htmlTemplate.replace(/\{\{TOTAL_AMOUNT\}\}/g, (invoice.totalAmount || 0).toFixed(2));
    htmlTemplate = htmlTemplate.replace(/\{\{DISCOUNT_ROW\}\}/g, discountRow);
    htmlTemplate = htmlTemplate.replace(/\{\{FINAL_AMOUNT\}\}/g, (invoice.finalAmount || 0).toFixed(2));
    htmlTemplate = htmlTemplate.replace(/\{\{PAID_AMOUNT\}\}/g, (invoice.paidAmount || 0).toFixed(2));
    htmlTemplate = htmlTemplate.replace(/\{\{BALANCE_ROW\}\}/g, balanceRow);
    htmlTemplate = htmlTemplate.replace(/\{\{PAYMENT_STATUS_HTML\}\}/g, paymentStatusHtml);
    htmlTemplate = htmlTemplate.replace(/\{\{TERMS_HTML\}\}/g, termsHtml);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice.invoiceIds || 'download'}.html`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).send(htmlTemplate);
});

// @desc Delete Invoice
// @route DELETE /api/billing/:id
// @access Private
export const deleteInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    // Delete associated sample if exists
    const sample = await Sample.findOne({ invoice: id });
    if (sample) {
        // Import TestResult dynamically to avoid circular dependency
        const TestResult = (await import('../models/TestResult.js')).default;
        if (TestResult) {
            await TestResult.deleteMany({ sample: sample._id });
        }
        // Delete the sample
        await sample.deleteOne();
    }

    // Delete the invoice
    await invoice.deleteOne();

    res.json({ message: 'Invoice deleted successfully' });
});
