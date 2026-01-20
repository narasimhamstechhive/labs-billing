
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './src/models/Test.js';
import Department from './src/models/Department.js';

// Load env vars
dotenv.config();

// Standard Laboratory Classification based on labTestsConfig.js
const TEST_CATALOG = [
    {
        category: "HEMATOLOGY",
        department: "Hematology",
        tests: [
            { name: "Haemoglobin (Hb)", unit: "g/dL", price: 150, sampleType: "EDTA Blood" },
            { name: "Total RBC Count", unit: "mil/µL", price: 150, sampleType: "EDTA Blood" },
            { name: "Total WBC Count", unit: "/µL", price: 150, sampleType: "EDTA Blood" },
            { name: "Platelet Count", unit: "lakhs/µL", price: 150, sampleType: "EDTA Blood" },
            { name: "PCV (Packed Cell Volume)", unit: "%", price: 150, sampleType: "EDTA Blood" },
            { name: "MCV", unit: "fL", price: 150, sampleType: "EDTA Blood" },
            { name: "MCH", unit: "pg", price: 150, sampleType: "EDTA Blood" },
            { name: "MCHC", unit: "g/dL", price: 150, sampleType: "EDTA Blood" },
            { name: "RDW-CV", unit: "%", price: 150, sampleType: "EDTA Blood" },
            { name: "ESR (Erythrocyte Sedimentation Rate)", unit: "mm/hr", price: 100, sampleType: "Citrated Blood" },
            { name: "Peripheral Smear Study", unit: "", price: 250, sampleType: "EDTA Slide" },
            { name: "Complete Blood Count (CBC)", unit: "", price: 400, sampleType: "EDTA Blood" }
        ]
    },
    {
        category: "BIOCHEMISTRY",
        department: "Biochemistry",
        tests: [
            { name: "Blood Glucose (Fasting) - FBS", unit: "mg/dL", price: 100, sampleType: "Fluoride Plasma" },
            { name: "Blood Glucose (Post Prandial) - PPBS", unit: "mg/dL", price: 100, sampleType: "Fluoride Plasma" },
            { name: "Blood Glucose (Random) - RBS", unit: "mg/dL", price: 100, sampleType: "Fluoride Plasma" },
            { name: "HbA1c (Glycosylated Haemoglobin)", unit: "%", price: 500, sampleType: "EDTA Blood" },
            { name: "Blood Urea", unit: "mg/dL", price: 150, sampleType: "Serum" },
            { name: "Serum Creatinine", unit: "mg/dL", price: 150, sampleType: "Serum" },
            { name: "Uric Acid", unit: "mg/dL", price: 200, sampleType: "Serum" },
            { name: "Lipid Profile", unit: "", price: 800, sampleType: "Serum" },
            { name: "Liver Function Test (LFT)", unit: "", price: 800, sampleType: "Serum" },
            { name: "Kidney Function Test (KFT)", unit: "", price: 800, sampleType: "Serum" }
        ]
    },
    {
        category: "CLINICAL PATHOLOGY",
        department: "Clinical Pathology",
        tests: [
            { name: "Urine Routine & Microscopy", unit: "", price: 200, sampleType: "Urine" },
            { name: "Stool Routine", unit: "", price: 200, sampleType: "Stool" },
            { name: "Semen Analysis", unit: "", price: 500, sampleType: "Semen" },
            { name: "Body Fluid Analysis", unit: "", price: 600, sampleType: "Body Fluid" }
        ]
    },
    {
        category: "SEROLOGY & IMMUNOLOGY",
        department: "Serology",
        tests: [
            { name: "Blood Grouping & Rh Typing", unit: "", price: 100, sampleType: "EDTA Blood" },
            { name: "Widal Test (Slide Method)", unit: "", price: 200, sampleType: "Serum" },
            { name: "VDRL / RPR", unit: "", price: 200, sampleType: "Serum" },
            { name: "HBsAg (Hepatitis B)", unit: "", price: 300, sampleType: "Serum" },
            { name: "HIV I & II (Screening)", unit: "", price: 400, sampleType: "Serum" },
            { name: "HCV (Hepatitis C)", unit: "", price: 400, sampleType: "Serum" },
            { name: "Dengue NS1 Antigen", unit: "", price: 600, sampleType: "Serum" },
            { name: "Dengue IgG & IgM", unit: "", price: 600, sampleType: "Serum" },
            { name: "Typhoid IgG / IgM", unit: "", price: 400, sampleType: "Serum" },
            { name: "RA Factor (Rheumatoid Factor)", unit: "IU/mL", price: 350, sampleType: "Serum" },
            { name: "CRP (C-Reactive Protein)", unit: "mg/L", price: 350, sampleType: "Serum" },
            { name: "ASO Titre", unit: "IU/mL", price: 400, sampleType: "Serum" }
        ]
    },
    {
        category: "HORMONES & ENDOCRINOLOGY",
        department: "Biochemistry",
        tests: [
            { name: "Thyroid Profile (T3, T4, TSH)", unit: "", price: 600, sampleType: "Serum" },
            { name: "Thyroid Stimulating Hormone (TSH)", unit: "µIU/mL", price: 300, sampleType: "Serum" },
            { name: "T3 (Triiodothyronine)", unit: "ng/dL", price: 250, sampleType: "Serum" },
            { name: "T4 (Thyroxine)", unit: "µg/dL", price: 250, sampleType: "Serum" },
            { name: "Beta HCG", unit: "mIU/mL", price: 600, sampleType: "Serum" },
            { name: "Prolactin", unit: "ng/mL", price: 500, sampleType: "Serum" }
        ]
    },
    {
        category: "MICROBIOLOGY",
        department: "Microbiology",
        tests: [
            { name: "Culture & Sensitivity (Urine)", unit: "", price: 800, sampleType: "Urine" },
            { name: "Culture & Sensitivity (Pus/Swab)", unit: "", price: 800, sampleType: "Swab" },
            { name: "Mantoux Test", unit: "mm", price: 200, sampleType: "Intradermal" }
        ]
    }
];

const seedTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // 1. Create Departments if they don't exist
        const departments = [...new Set(TEST_CATALOG.map(c => c.department))];
        const deptMap = {};

        for (const deptName of departments) {
            let dept = await Department.findOne({ name: deptName });
            if (!dept) {
                dept = await Department.create({
                    name: deptName,
                    description: `${deptName} Department`
                });
                console.log(`Created Department: ${deptName}`);
            }
            deptMap[deptName] = dept._id;
        }

        // 2. Create Tests
        let addedCount = 0;

        for (const category of TEST_CATALOG) {
            const deptId = deptMap[category.department];

            for (const testData of category.tests) {
                // Check if test exists
                const exists = await Test.findOne({ testName: testData.name });

                if (!exists) {
                    await Test.create({
                        testName: testData.name,
                        code: testData.name.substring(0, 4).toUpperCase() + Math.floor(Math.random() * 1000),
                        department: deptId,
                        sampleType: testData.sampleType,
                        price: testData.price,
                        unit: testData.unit,
                        tat: 24, // Turnaround time default
                        normalRanges: {
                            general: "" // Populated dynamically in report based on config
                        }
                    });
                    console.log(`Added Test: ${testData.name}`);
                    addedCount++;
                }
            }
        }

        console.log(`Seeding Complete! Added ${addedCount} new tests.`);
        process.exit();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedTests();
