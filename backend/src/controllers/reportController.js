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
        // Handle both local and Vercel serverless paths
        const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
        let templatePath;
        
        if (isVercel) {
            // In Vercel, use process.cwd() relative path
            templatePath = path.join(process.cwd(), 'src', 'templates', 'report.html');
        } else {
            // Local development
            templatePath = path.join(__dirname, '..', 'templates', 'report.html');
        }

        if (!fs.existsSync(templatePath)) {
            // Try alternative path for Vercel
            const altPath = path.join(process.cwd(), 'backend', 'src', 'templates', 'report.html');
            if (fs.existsSync(altPath)) {
                templatePath = altPath;
            } else {
                return res.status(500).json({ message: 'Report template not found' });
            }
        }

        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Prepare logo HTML
        let logoHtml = '';
        if (settings.logo) {
            // Check if logo is base64 (from Vercel memory storage) or file path
            if (settings.logo.startsWith('data:image')) {
                // Base64 image from memory storage
                logoHtml = `<img src="${settings.logo}" style="width:90px;" />`;
            } else {
                // File path - construct full URL
                const baseUrl = req.protocol + '://' + req.get('host');
                const logoUrl = baseUrl + settings.logo;
                logoHtml = `<img src="${logoUrl}" style="width:90px;" />`;
            }
        }

        // Format dates
        const collectedOn = sample.collectionDate 
            ? new Date(sample.collectionDate).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : new Date(sample.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const reportedOn = new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        // Group results by department
        const departments = {};
        results.forEach(r => {
            const deptName = r.test.department?.name?.toUpperCase() || 'GENERAL';
            if (!departments[deptName]) departments[deptName] = [];
            departments[deptName].push(r);
        });

        // Generate report for first department (or combine if needed)
        const firstDept = Object.keys(departments)[0];
        const deptResults = departments[firstDept];
        const mainTest = deptResults[0].test;

        // Build test results rows
        let testResultsRows = '';
        deptResults.forEach(r => {
            const hasSubtests = r.subtests && r.subtests.length > 0;
            
            if (r.resultValue || !hasSubtests) {
                const resultValue = r.resultValue || '';
                const abnormalClass = r.abnormal ? 'color:red; font-weight:bold;' : '';
                const abnormalText = r.abnormal ? ` (Abnormal)` : '';
                const arrow = r.abnormal ? ' ▲' : '';
                
                const unit = r.test.unit || '-';
                const range = r.test.normalRanges?.general || 
                    (r.test.normalRanges?.male ? `${r.test.normalRanges.male.min} – ${r.test.normalRanges.male.max}` : '-');

                testResultsRows += `
                    <tr>
                        <td style="padding:8px;"><b>${r.test.testName}</b></td>
                        <td style="padding:8px; ${abnormalClass}">${resultValue}${abnormalText}${arrow}</td>
                        <td style="padding:8px;">${unit}</td>
                        <td style="padding:8px;">${range}</td>
                    </tr>
                `;
            }

            // Add subtests
            if (hasSubtests && r.subtests) {
                r.subtests.forEach(sub => {
                    const abnormalClass = sub.abnormal ? 'color:red; font-weight:bold;' : '';
                    const abnormalText = sub.abnormal ? ` (Abnormal)` : '';
                    const arrow = sub.abnormal ? ' ▲' : '';
                    
                    testResultsRows += `
                        <tr>
                            <td style="padding:8px;">${sub.testName}</td>
                            <td style="padding:8px; ${abnormalClass}">${sub.resultValue}${abnormalText}${arrow}</td>
                            <td style="padding:8px;">${sub.unit || '-'}</td>
                            <td style="padding:8px;">${sub.normalRange || '-'}</td>
                        </tr>
                    `;
                });
            }
        });

        // Get interpretation from remarks
        const interpretation = deptResults.find(r => r.remarks)?.remarks || 'Values marked abnormal are outside the reference range.';

        // Replace placeholders
        htmlTemplate = htmlTemplate.replace('{{LOGO_HTML}}', logoHtml);
        htmlTemplate = htmlTemplate.replace('{{LAB_NAME}}', settings.labName || 'labs ph center');
        htmlTemplate = htmlTemplate.replace('{{LAB_MOBILE}}', settings.mobile || '7879999979');
        htmlTemplate = htmlTemplate.replace('{{LAB_EMAIL}}', settings.email || 'busaramahesh12@gmail.com');
        htmlTemplate = htmlTemplate.replace('{{PATIENT_NAME}}', sample.patient.name || 'N/A');
        htmlTemplate = htmlTemplate.replace('{{PATIENT_AGE}}', sample.patient.age || 'N/A');
        htmlTemplate = htmlTemplate.replace('{{PATIENT_GENDER}}', sample.patient.gender || 'N/A');
        htmlTemplate = htmlTemplate.replace('{{REFERRING_DOCTOR}}', sample.patient.referringDoctor || 'Dr. Self');
        htmlTemplate = htmlTemplate.replace('{{SAMPLE_TYPE}}', sample.sampleType || 'EDTA Blood');
        htmlTemplate = htmlTemplate.replace('{{SAMPLE_ID}}', sample.sampleId || 'N/A');
        htmlTemplate = htmlTemplate.replace('{{REG_NO}}', sample.patient.patientId || 'N/A');
        htmlTemplate = htmlTemplate.replace('{{COLLECTED_ON}}', collectedOn);
        htmlTemplate = htmlTemplate.replace('{{REPORTED_ON}}', reportedOn);
        htmlTemplate = htmlTemplate.replace('{{DEPARTMENT_NAME}}', firstDept || 'GENERAL');
        htmlTemplate = htmlTemplate.replace('{{TEST_NAME}}', mainTest.testName?.toUpperCase() || 'TEST REPORT');
        htmlTemplate = htmlTemplate.replace('{{TEST_RESULTS_ROWS}}', testResultsRows);
        htmlTemplate = htmlTemplate.replace('{{INTERPRETATION}}', interpretation);

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
