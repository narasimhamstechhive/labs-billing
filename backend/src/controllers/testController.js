import Test from '../models/Test.js';
import asyncHandler from 'express-async-handler';

// @desc Get all tests
// @route GET /api/tests
// @access Private
export const getTests = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query; // Higher limit for tests as they are usually many
    const query = { isDeleted: false };

    const skip = (Number(page) - 1) * Number(limit);

    const tests = await Test.find(query)
        .populate('department', 'name')
        .sort({ testName: 1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Test.countDocuments(query);

    res.json({
        tests,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
    });
});

// @desc Create a test
// @route POST /api/tests
// @access Private (Admin/Manager)
export const createTest = asyncHandler(async (req, res) => {
    const test = await Test.create(req.body);
    res.status(201).json(test);
});

// @desc Update a test
// @route PUT /api/tests/:id
// @access Private (Admin/Manager)
export const updateTest = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const updatedTest = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTest);
});

// @desc Delete a test
// @route DELETE /api/tests/:id
// @access Private (Admin/Manager)
export const deleteTest = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id);
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    test.isDeleted = true;
    await test.save();
    res.json({ message: 'Test removed' });
});
