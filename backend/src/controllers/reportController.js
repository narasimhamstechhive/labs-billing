import TestResult from '../models/TestResult.js';
import Sample from '../models/Sample.js';
import Test from '../models/Test.js';
import LabSettings from '../models/LabSettings.js';
import fs from 'fs';
import path from 'path';

// @desc Get pending results (Samples with status Collected but Results not Approved)
// @route GET /api/reports/pending
// @access Private
export const getPendingResults = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query = { status: 'Collected' };

        const skip = (Number(page) - 1) * Number(limit);

        const samples = await Sample.find(query)
            .populate('patient', 'name patientId age gender')
            .populate('tests', 'testName unit normalRanges')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Sample.countDocuments(query);

        res.json({
            samples,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Submit Results
// @route POST /api/reports/submit
// @access Private (Technician)
export const submitResults = async (req, res) => {
    try {
        const { sampleId, results } = req.body; // results: [{ testId, value, remarks, abnormal }]
        const sample = await Sample.findById(sampleId);
        if (!sample) return res.status(404).json({ message: 'Sample not found' });

        const promises = results.map(async (r) => {
            // Check if result already exists
            let testResult = await TestResult.findOne({ sample: sampleId, test: r.testId });

            if (testResult) {
                testResult.resultValue = r.value;
                testResult.abnormal = r.abnormal;
                testResult.remarks = r.remarks;
                testResult.subtests = r.subtests || [];
                testResult.enteredBy = req.user._id;
                testResult.status = 'Entered';
                return testResult.save();
            } else {
                return TestResult.create({
                    sample: sampleId,
                    test: r.testId,
                    patient: sample.patient,
                    resultValue: r.value,
                    abnormal: r.abnormal,
                    remarks: r.remarks,
                    subtests: r.subtests || [],
                    enteredBy: req.user._id,
                    status: 'Entered'
                });
            }
        });

        await Promise.all(promises);

        // Update Sample Status to Processing
        sample.status = 'Processing';
        await sample.save();

        res.json({ message: 'Results Submitted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Approve Results
// @route PUT /api/reports/approve/:sampleId
// @access Private (Pathologist)
export const approveResults = async (req, res) => {
    try {
        const { sampleId } = req.params;
        const results = await TestResult.find({ sample: sampleId });

        if (results.length === 0) return res.status(400).json({ message: 'No results to approve' });

        const promises = results.map(r => {
            r.status = 'Approved';
            r.approvedBy = req.user._id;
            r.approvalDate = Date.now();
            return r.save();
        });

        await Promise.all(promises);

        // Update Sample to Approved
        await Sample.findByIdAndUpdate(sampleId, { status: 'Approved' });

        res.json({ message: 'Results Approved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc Generate HTML Report
// @route GET /api/reports/print/:sampleId
// @access Private
export const printReport = async (req, res) => {
    try {
        const { sampleId } = req.params;
        const sample = await Sample.findById(sampleId).populate('patient');
        const results = await TestResult.find({ sample: sampleId })
            .populate({
                path: 'test',
                populate: { path: 'department' }
            });

        if (!sample) {
            return res.status(404).json({ message: 'Sample not found' });
        }

        if (!results || results.length === 0) {
            return res.status(400).json({ message: 'No test results found for this sample' });
        }

        // Fetch Lab Settings
        let settings = await LabSettings.findOne();
        if (!settings) {
            settings = {
                labName: 'labs ph center',
                address: '',
                mobile: '7879999979',
                email: 'busaramahesh12@gmail.com',
                logo: ''
            };
        }

        // Read HTML template
        // Robust Path Handling for Local vs Production (Vercel)
        // Read HTML template
        // Robust Path Handling for Local vs Production (Vercel)
        let templatePath;
        const isVercel = process.env.VERCEL === '1';

        if (isVercel) {
            templatePath = path.join(process.cwd(), 'src', 'templates', 'MainReport.html');
            if (!fs.existsSync(templatePath)) {
                templatePath = path.join(process.cwd(), 'backend', 'src', 'templates', 'MainReport.html');
            }
        } else {
            templatePath = path.join(__dirname, '..', 'templates', 'MainReport.html');
        }

        if (!fs.existsSync(templatePath)) {
            console.error(`Report template not found at: ${templatePath}`);
            const fallbackPath = path.resolve('src/templates/MainReport.html');
            if (fs.existsSync(fallbackPath)) {
                templatePath = fallbackPath;
            } else {
                return res.status(500).json({ message: 'Report template not found on server' });
            }
        }

        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Prepare logo HTML
        let logoHtml = '';
        if (settings.logo) {
            if (settings.logo.startsWith('data:image') || settings.logo.startsWith('http')) {
                // Base64 or Cloudinary URL
                logoHtml = `<img src="${settings.logo}" alt="Lab Logo" style="max-height: 80px;">`;
            } else {
                // Local relative path
                const baseUrl = req.protocol + '://' + req.get('host');
                const logoUrl = baseUrl + settings.logo;
                logoHtml = `<img src="${logoUrl}" alt="Lab Logo" style="max-height: 80px;">`;
            }
        }

        // Format dates
        const collectedOn = sample.collectionDate
            ? new Date(sample.collectionDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : new Date(sample.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const reportedOn = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Group results by department
        const departments = {};
        results.forEach(r => {
            const deptName = r.test.department?.name?.toUpperCase() || 'GENERAL';
            if (!departments[deptName]) departments[deptName] = [];
            departments[deptName].push(r);
        });

        // Generate report for first department
        const firstDept = Object.keys(departments)[0];
        const deptResults = departments[firstDept];
        const mainTest = deptResults[0].test;

        // Build test results rows
        let testResultsRows = '';
        deptResults.forEach(r => {
            const hasSubtests = r.subtests && r.subtests.length > 0;

            // Logic for High/Low/Borderline classes
            // For now, we stick to simple "abnormal" logic mapping to "high" class for red color
            const statusClass = r.abnormal ? 'high' : '';
            const statusText = r.abnormal ? ' (Abnormal)' : '';

            const range = r.test.normalRanges?.general ||
                (r.test.normalRanges?.male ? `${r.test.normalRanges.male.min} – ${r.test.normalRanges.male.max}` : '-');

            if (r.resultValue || !hasSubtests) {
                testResultsRows += `
                    <tr>
                        <td>${r.test.testName}</td>
                        <td class="${statusClass}">${r.resultValue || ''}${statusText}</td>
                        <td>${r.test.unit || '-'}</td>
                    </tr>
                `;
            }

            // Add subtests
            if (hasSubtests && r.subtests) {
                // Add a section header for the main test to match MainReport structure
                testResultsRows += `<tr class="section"><td colspan="3">${r.test.testName.toUpperCase()}</td></tr>`;

                r.subtests.forEach(sub => {
                    const subStatusClass = sub.abnormal ? 'high' : '';
                    const subStatusText = sub.abnormal ? ' (Abnormal)' : '';
                    testResultsRows += `
                        <tr>
                            <td>${sub.testName}</td>
                            <td class="${subStatusClass}">${sub.resultValue}${subStatusText}</td>
                            <td>${sub.unit || '-'}</td>
                        </tr>
                    `;
                });
            }
        });

        // Get interpretation
        const interpretation = deptResults.find(r => r.remarks)?.remarks || 'Values marked abnormal are outside the reference range.';

        // Replace placeholders (Global replace for all occurrences)
        htmlTemplate = htmlTemplate.replace(/{{LOGO_HTML}}/g, logoHtml);
        htmlTemplate = htmlTemplate.replace(/{{LAB_NAME}}/g, settings.labName || 'LABORATORY CENTER');
        htmlTemplate = htmlTemplate.replace(/{{LAB_TAGLINE}}/g, 'Accurate | Caring | Instant');
        htmlTemplate = htmlTemplate.replace(/{{LAB_ADDRESS}}/g, settings.address || '');
        htmlTemplate = htmlTemplate.replace(/{{LAB_PHONE}}/g, settings.mobile || '');
        htmlTemplate = htmlTemplate.replace(/{{LAB_EMAIL}}/g, settings.email || '');

        htmlTemplate = htmlTemplate.replace(/{{PATIENT_NAME}}/g, sample.patient.name || 'N/A');
        htmlTemplate = htmlTemplate.replace(/{{PATIENT_AGE}}/g, String(sample.patient.age) || 'N/A');
        htmlTemplate = htmlTemplate.replace(/{{PATIENT_GENDER}}/g, sample.patient.gender || 'N/A');
        htmlTemplate = htmlTemplate.replace(/{{PATIENT_ID}}/g, sample.patient.patientId || 'N/A');
        htmlTemplate = htmlTemplate.replace(/{{SAMPLE_LOCATION}}/g, 'Lab Centre');

        htmlTemplate = htmlTemplate.replace(/{{REFERRING_DOCTOR}}/g, sample.patient.referringDoctor || 'Self');
        htmlTemplate = htmlTemplate.replace(/{{REPORT_DATE}}/g, reportedOn);

        htmlTemplate = htmlTemplate.replace(/{{TEST_TITLE}}/g, mainTest.testName?.toUpperCase() || 'LAB REPORT');
        htmlTemplate = htmlTemplate.replace(/{{TEST_RESULTS_ROWS}}/g, testResultsRows);
        htmlTemplate = htmlTemplate.replace(/{{INTERPRETATION}}/g, interpretation);

        // Set headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename=report-${sampleId}.html`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.status(200).send(htmlTemplate);

    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ message: error.message });
    }
};
