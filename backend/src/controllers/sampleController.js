import Sample from '../models/Sample.js';
import TestResult from '../models/TestResult.js';

// @desc Get samples (with filters and pagination)
// @route GET /api/samples
// @access Private
export const getSamples = async (req, res) => {
    try {
        const { status, patientId, date, from, to, page = 1, limit = 10 } = req.query;
        const query = {};

        // Handle multiple statuses (for Reports page)
        if (status) {
            if (status.includes(',')) {
                query.status = { $in: status.split(',') };
            } else {
                query.status = status;
            }
        }

        if (patientId) query.patient = patientId;
        if (from && to) {
            query.createdAt = {
                $gte: new Date(from),
                $lte: new Date(new Date(to).setHours(23, 59, 59, 999))
            };
        } else if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const samples = await Sample.find(query)
            .populate('patient', 'name age gender patientId')
            .populate('tests', 'testName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Sample.countDocuments(query);

        // Get global stats for ALL samples (not just today)
        const allStats = await Sample.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statsMap = allStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const stats = {
            pending: statsMap['Pending'] || 0,
            collected: statsMap['Collected'] || 0,
            processing: statsMap['Processing'] || 0,
            completed: statsMap['Completed'] || 0,
            approved: statsMap['Approved'] || 0
        };

        console.log('[SAMPLE STATS]', stats);

        res.json({
            samples,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            stats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete Sample and associated results
// @route DELETE /api/samples/:id
// @access Private (Admin)
export const deleteSample = async (req, res) => {
    try {
        const sample = await Sample.findById(req.params.id);
        if (!sample) return res.status(404).json({ message: 'Sample not found' });

        // Delete associated TestResults
        await TestResult.deleteMany({ sample: sample._id });

        // Delete the Sample
        await sample.deleteOne();

        res.json({ message: 'Sample and associated results deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Sample Status (Collect, Process, etc.)
// @route PUT /api/samples/:id/status
// @access Private (Technician/Admin)
export const updateSampleStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const sample = await Sample.findById(req.params.id);

        if (!sample) return res.status(404).json({ message: 'Sample not found' });

        sample.status = status;
        if (remarks) sample.remarks = remarks;

        if (status === 'Collected') {
            sample.collectionDate = Date.now();
            sample.collectedBy = req.user._id;
        }

        await sample.save();
        res.json(sample);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
