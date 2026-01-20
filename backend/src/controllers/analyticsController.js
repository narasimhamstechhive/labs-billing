import Invoice from '../models/Invoice.js';
import Sample from '../models/Sample.js';
import Patient from '../models/Patient.js';

// @desc Get Analytics Data
// @route GET /api/analytics
// @access Private
export const getAnalytics = async (req, res) => {
    try {
        const { range = 'today', date, from, to } = req.query;

        // Calculate date range
        let startDate = new Date();
        let endDate = new Date();

        if (from && to) {
            startDate = new Date(from);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(to);
            endDate.setHours(23, 59, 59, 999);
        } else if (date) {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'today') {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === '7days') {
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === '30days') {
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        // Today's Revenue
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayRevenue = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: todayStart, $lte: todayEnd }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$paidAmount' }
                }
            }
        ]);

        // Total Revenue (for selected range)
        const totalRevenue = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$paidAmount' }
                }
            }
        ]);

        // Today's Collections Count
        const todayCollections = await Sample.countDocuments({
            collectionDate: { $gte: todayStart, $lte: todayEnd }
        });

        // Total Tests (for selected range)
        const totalTests = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $unwind: '$tests'
            },
            {
                $count: 'total'
            }
        ]);

        // Payment Method Breakdown (for selected range)
        const paymentBreakdown = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$paymentMode',
                    count: { $sum: 1 },
                    amount: { $sum: '$paidAmount' }
                }
            }
        ]);

        // Get detailed invoices for CSV export
        const invoices = await Invoice.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate('patient', 'name patientId mobile')
            .populate('tests', 'testName price')
            .sort({ createdAt: -1 });

        // Get detailed collections for CSV export
        const collections = await Sample.find({
            collectionDate: { $gte: startDate, $lte: endDate }
        })
            .populate('patient', 'name patientId mobile')
            .populate('tests', 'testName')
            .sort({ collectionDate: -1 });

        console.log('[ANALYTICS] Range:', range);
        console.log('[ANALYTICS] Date Range:', { startDate, endDate });
        console.log('[ANALYTICS] Invoices Count:', invoices.length);
        console.log('[ANALYTICS] Collections Count:', collections.length);

        res.json({
            todayRevenue: todayRevenue[0]?.total || 0,
            totalRevenue: totalRevenue[0]?.total || 0,
            todayCollections,
            totalTests: totalTests[0]?.total || 0,
            paymentBreakdown: paymentBreakdown.map(p => ({
                method: p._id,
                count: p.count,
                amount: p.amount
            })),
            invoices: invoices.map(inv => ({
                invoiceId: inv.invoiceIds,
                date: inv.createdAt,
                patient: inv.patient?.name || 'N/A',
                patientId: inv.patient?.patientId || 'N/A',
                mobile: inv.patient?.mobile || 'N/A',
                tests: inv.tests?.map(t => t.testName).join(', ') || 'N/A',
                amount: inv.finalAmount,
                paid: inv.paidAmount,
                balance: inv.balance,
                paymentMode: inv.paymentMode
            })),
            collections: collections.map(col => ({
                sampleId: col.sampleId,
                date: col.collectionDate,
                patient: col.patient?.name || 'N/A',
                patientId: col.patient?.patientId || 'N/A',
                tests: col.tests?.map(t => t.testName).join(', ') || 'N/A',
                status: col.status
            }))
        });
    } catch (error) {
        console.error('[ANALYTICS ERROR]', error);
        res.status(500).json({ message: error.message });
    }
};
