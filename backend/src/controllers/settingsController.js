import LabSettings from '../models/LabSettings.js';

// @desc    Get lab settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
    try {
        let settings = await LabSettings.findOne();

        // Create initial settings if none exist
        if (!settings) {
            settings = await LabSettings.create({
                labName: 'MediLab Laboratory',
                address: 'Please set your lab address',
                mobile: '0000000000'
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update lab settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        let settings = await LabSettings.findOne();

        if (!settings) {
            settings = await LabSettings.create(req.body);
        } else {
            settings = await LabSettings.findByIdAndUpdate(settings._id, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Upload lab logo
// @route   POST /api/settings/logo
// @access  Private
export const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // For Vercel (serverless), files are in memory
        // In production, consider using cloud storage (S3, Cloudinary, Vercel Blob)
        if (process.env.VERCEL || !req.file.path) {
            // Memory storage - convert to base64 for storage in database
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            res.status(200).json({
                filePath: base64Image,
                isBase64: true
            });
        } else {
            // Disk storage - return file path
            res.status(200).json({
                filePath: `/uploads/${req.file.filename}`,
                isBase64: false
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
