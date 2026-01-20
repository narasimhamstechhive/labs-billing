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

        // With Cloudinary storage, req.file.path is the secure URL
        const filePath = req.file.path || req.file.secure_url;

        res.status(200).json({
            filePath,
            isCloudinary: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
