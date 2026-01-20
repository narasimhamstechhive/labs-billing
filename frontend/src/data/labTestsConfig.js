export const LAB_TESTS_CONFIG = {
    // A. HAEMATOLOGY
    "Haemoglobin (Hb)": [
        { key: "hemoglobinValue", label: "Hemoglobin", unit: "g/dL", type: "number", priority: "high" },
        { key: "resultStatus", label: "Result Status", type: "select", options: ["Normal", "Abnormal", "Critical"], priority: "high" }
    ],
    "Total WBC Count": [
        { key: "totalWbcCount", label: "Total WBC Count", unit: "/μL", type: "number", priority: "high" },
        { key: "resultStatus", label: "Result Status", type: "select", options: ["Normal", "Abnormal"], priority: "high" }
    ],
    "RBC Count": [
        { key: "rbcCount", label: "RBC Count", unit: "mill/μL", type: "number", priority: "high" },
        { key: "resultStatus", label: "Result Status", type: "select", options: ["Normal", "Abnormal"], priority: "high" }
    ],
    "Platelet Count": [
        { key: "plateletCount", label: "Platelet Count", unit: "/μL", type: "number", priority: "high" },
        { key: "resultStatus", label: "Result Status", type: "select", options: ["Normal", "Abnormal"], priority: "high" }
    ],
    "RBC Indices": [
        { key: "mcv", label: "MCV", unit: "fL", type: "number", priority: "high" },
        { key: "mch", label: "MCH", unit: "pg", type: "number", priority: "high" },
        { key: "mchc", label: "MCHC", unit: "g/dL", type: "number", priority: "high" },
        { key: "rdw", label: "RDW", unit: "%", type: "number", priority: "high" }
    ],
    "Complete Blood Count": [ // Alias/Panel combining above
        { key: "hemoglobinValue", label: "Hemoglobin", unit: "g/dL", type: "number", priority: "high" },
        { key: "totalWbcCount", label: "Total WBC Count", unit: "/μL", type: "number", priority: "high" },
        { key: "rbcCount", label: "RBC Count", unit: "mill/μL", type: "number", priority: "high" },
        { key: "plateletCount", label: "Platelet Count", unit: "/μL", type: "number", priority: "high" },
        { key: "mcv", label: "MCV", unit: "fL", type: "number", priority: "high" },
        { key: "mch", label: "MCH", unit: "pg", type: "number", priority: "high" },
        { key: "mchc", label: "MCHC", unit: "g/dL", type: "number", priority: "high" },
        { key: "rdw", label: "RDW", unit: "%", type: "number", priority: "high" }
    ],
    "Reticulocyte Count": [
        { key: "reticulocyteCount", label: "Reticulocyte Count", unit: "%", type: "number", priority: "high" }
    ],
    "ESR (Westergren)": [
        { key: "esrValue", label: "ESR (Westergren)", unit: "mm/hr", type: "number", priority: "high" }
    ],
    "Absolute Neutrophil Count": [
        { key: "ancValue", label: "ANC", unit: "/μL", type: "number", priority: "high", readOnly: false }
    ],
    "Absolute Eosinophil Count": [
        { key: "aecValue", label: "AEC", unit: "/μL", type: "number", priority: "high" }
    ],
    "Peripheral Smear": [
        { key: "peripheralSmearReport", label: "Peripheral Smear", unit: "Text", type: "textarea", priority: "high" }
    ],
    "Coagulation Profile": [
        { key: "prothrombinTime", label: "Prothrombin Time", unit: "sec", type: "number", priority: "high" },
        { key: "inrValue", label: "INR", unit: "", type: "number", priority: "high" },
        { key: "apttValue", label: "APTT", unit: "sec", type: "number", priority: "high" }
    ],
    "D-Dimer": [
        { key: "dDimerValue", label: "D-Dimer", unit: "ng/mL", type: "number", priority: "high" }
    ],
    "Fibrinogen": [
        { key: "fibrinogenValue", label: "Fibrinogen", unit: "mg/dL", type: "number", priority: "high" }
    ],
    "Bleeding Time": [
        { key: "bleedingTime", label: "Bleeding Time", unit: "min", type: "number", priority: "high" }
    ],
    "Clotting Time": [
        { key: "clottingTime", label: "Clotting Time", unit: "min", type: "number", priority: "high" }
    ],
    "Direct Coombs Test": [
        { key: "directCoombsResult", label: "Direct Coombs Test", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],
    "Indirect Coombs Test": [
        { key: "indirectCoombsResult", label: "Indirect Coombs Test", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],

    // B. CLINICAL BIOCHEMISTRY
    "Sodium": [{ key: "sodiumValue", label: "Sodium", unit: "mEq/L", type: "number", priority: "high" }],
    "Potassium": [{ key: "potassiumValue", label: "Potassium", unit: "mEq/L", type: "number", priority: "high" }],
    "Chloride": [{ key: "chlorideValue", label: "Chloride", unit: "mEq/L", type: "number", priority: "high" }],
    "Bicarbonate": [{ key: "bicarbonateValue", label: "Bicarbonate", unit: "mEq/L", type: "number", priority: "high" }],

    "Uric Acid": [{ key: "uricAcidValue", label: "Uric Acid", unit: "mg/dL", type: "number", priority: "high" }],
    "Kidney Function Test (KFT)": [
        { key: "sodiumValue", label: "Sodium", unit: "mEq/L", type: "number", priority: "high" },
        { key: "potassiumValue", label: "Potassium", unit: "mEq/L", type: "number", priority: "high" },
        { key: "chlorideValue", label: "Chloride", unit: "mEq/L", type: "number", priority: "high" },
        { key: "bicarbonateValue", label: "Bicarbonate", unit: "mEq/L", type: "number", priority: "high" },
        { key: "bunValue", label: "BUN", unit: "mg/dL", type: "number", priority: "high" },
        { key: "serumCreatinine", label: "Serum Creatinine", unit: "mg/dL", type: "number", priority: "high" },
        { key: "uricAcidValue", label: "Uric Acid", unit: "mg/dL", type: "number", priority: "high" }
    ],

    // Glucose & Diabetes

    "HbA1c": [{ key: "hba1cValue", label: "HbA1c", unit: "%", type: "number", priority: "high" }],
    "Glucose Tolerance Test": [
        { key: "ogtt0Min", label: "OGTT 0 Min", unit: "mg/dL", type: "number", priority: "high" },
        { key: "ogtt60Min", label: "OGTT 60 Min", unit: "mg/dL", type: "number", priority: "high" },
        { key: "ogtt120Min", label: "OGTT 120 Min", unit: "mg/dL", type: "number", priority: "high" }
    ],
    "Insulin": [{ key: "fastingInsulin", label: "Fasting Insulin", unit: "μIU/mL", type: "number", priority: "high" }],
    "C-Peptide": [{ key: "cPeptide", label: "C-Peptide", unit: "ng/mL", type: "number", priority: "high" }],

    // Cardiac Markers
    "Troponin I": [{ key: "troponinValue", label: "Troponin I", unit: "ng/mL", type: "number", priority: "high" }],
    "CPK Total": [{ key: "cpkTotal", label: "CPK Total", unit: "U/L", type: "number", priority: "high" }],
    "CPK-MB": [{ key: "cpkMb", label: "CPK-MB", unit: "U/L", type: "number", priority: "high" }],
    "LDH": [{ key: "ldhValue", label: "LDH", unit: "U/L", type: "number", priority: "high" }],
    "Myoglobin": [{ key: "myoglobinValue", label: "Myoglobin", unit: "ng/mL", type: "number", priority: "medium" }],

    // Pancreatic
    "Amylase": [{ key: "amylaseValue", label: "Amylase", unit: "U/L", type: "number", priority: "high" }],
    "Lipase": [{ key: "lipaseValue", label: "Lipase", unit: "U/L", type: "number", priority: "high" }],

    // Inflammation

    "hs-CRP": [{ key: "hsCrpValue", label: "hs-CRP", unit: "mg/L", type: "number", priority: "medium" }],
    "Homocysteine": [{ key: "homocysteineValue", label: "Homocysteine", unit: "μmol/L", type: "number", priority: "high" }],

    // Iron Studies
    "Iron Studies": [
        { key: "serumIron", label: "Serum Iron", unit: "μg/dL", type: "number", priority: "high" },
        { key: "tibcValue", label: "TIBC", unit: "μg/dL", type: "number", priority: "high" },
        { key: "transferrinSaturation", label: "Transferrin Saturation", unit: "%", type: "number", priority: "medium" },
        { key: "fertinValue", label: "Ferritin", unit: "ng/mL", type: "number", priority: "high" }
    ],

    // C. LIVER FUNCTION TESTS
    "Liver Function Test (LFT)": [
        { key: "totalBilirubin", label: "Total Bilirubin", unit: "mg/dL", type: "number", priority: "high" },
        { key: "directBilirubin", label: "Direct Bilirubin", unit: "mg/dL", type: "number", priority: "high" },
        { key: "indirectBilirubin", label: "Indirect Bilirubin", unit: "mg/dL", type: "number", priority: "medium" },
        { key: "sgotAst", label: "SGOT (AST)", unit: "U/L", type: "number", priority: "high" },
        { key: "sgptAlt", label: "SGPT (ALT)", unit: "U/L", type: "number", priority: "high" },
        { key: "alpValue", label: "ALP", unit: "U/L", type: "number", priority: "high" },
        { key: "ggtValue", label: "GGT", unit: "U/L", type: "number", priority: "high" },
        { key: "totalProtein", label: "Total Protein", unit: "g/dL", type: "number", priority: "high" },
        { key: "albuminValue", label: "Albumin", unit: "g/dL", type: "number", priority: "high" },
        { key: "globulinValue", label: "Globulin", unit: "g/dL", type: "number", priority: "medium" },
        { key: "agRatio", label: "A/G Ratio", unit: "", type: "number", priority: "medium" }
    ],

    // D. LIPID PROFILE
    "Lipid Profile": [
        { key: "totalCholesterol", label: "Total Cholesterol", unit: "mg/dL", type: "number", priority: "high" },
        { key: "hdlCholesterol", label: "HDL Cholesterol", unit: "mg/dL", type: "number", priority: "high" },
        { key: "ldlCholesterol", label: "LDL Cholesterol", unit: "mg/dL", type: "number", priority: "high" },
        { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", type: "number", priority: "high" },
        { key: "vldlValue", label: "VLDL", unit: "mg/dL", type: "number", priority: "medium" },
        { key: "nonHdlCholesterol", label: "Non-HDL Cholesterol", unit: "mg/dL", type: "number", priority: "medium" }
    ],

    // E. ENDOCRINOLOGY
    "Thyroid Profile (T3, T4, TSH)": [
        { key: "tshValue", label: "TSH", unit: "μIU/mL", type: "number", priority: "high" },
        { key: "freeT4", label: "Free T4", unit: "ng/dL", type: "number", priority: "high" },
        { key: "freeT3", label: "Free T3", unit: "pg/mL", type: "number", priority: "high" },
        { key: "totalT4", label: "Total T4", unit: "μg/dL", type: "number", priority: "high" },
        { key: "totalT3", label: "Total T3", unit: "ng/dL", type: "number", priority: "high" }
    ],

    // ... Add more hormones as single tests
    "Vitamin D": [{ key: "vitaminDValue", label: "Vitamin D (25-OH)", unit: "ng/mL", type: "number", priority: "high" }],
    "Vitamin B12": [{ key: "vitaminB12Value", label: "Vitamin B12", unit: "pg/mL", type: "number", priority: "high" }],

    // F. TUMOR MARKERS
    "PSA": [{ key: "psaTotal", label: "PSA (Total)", unit: "ng/mL", type: "number", priority: "high" }],
    "CEA": [{ key: "ceaValue", label: "CEA", unit: "ng/mL", type: "number", priority: "high" }],
    "CA-125": [{ key: "ca125Value", label: "CA-125", unit: "U/mL", type: "number", priority: "high" }],

    // G. INFECTIOUS


    // H. MICROBIOLOGY

    "Malaria": [
        { key: "malariaSpecies", label: "Species", unit: "", type: "select", options: ["P. vivax", "P. falciparum", "Negative"], priority: "high" },
        { key: "malariaParasitemia", label: "Parasitemia", unit: "%", type: "number", priority: "high" }
    ],

    // I. URINE ANALYSIS
    "Urine Routine & Microscopy": [
        { key: "urineColor", label: "Color", unit: "", type: "select", options: ["Pale Yellow", "Yellow", "Dark Yellow", "Red", "Amber"], priority: "high" },
        { key: "urineTransparency", label: "Appearance", unit: "", type: "select", options: ["Clear", "Hazy", "Cloudy", "Turbid"], priority: "high" },
        { key: "urinePh", label: "pH", unit: "", type: "number", priority: "high" },
        { key: "urineSpecificGravity", label: "Specific Gravity", unit: "", type: "number", priority: "high" },
        { key: "urineGlucose", label: "Glucose", unit: "", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+", "4+"], priority: "high" },
        { key: "urineProtein", label: "Protein", unit: "", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+", "4+"], priority: "high" },
        { key: "urineKetones", label: "Ketones", unit: "", type: "select", options: ["Nil", "Trace", "1+", "2+", "3+", "4+"], priority: "high" },
        { key: "urineBilirubin", label: "Bilirubin", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "urineUrobilinogen", label: "Urobilinogen", unit: "", type: "select", options: ["Normal", "Increased"], priority: "high" },
        { key: "urineNitrite", label: "Nitrite", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "urineLeukocyteEsterase", label: "Leukocyte Esterase", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "urineRbc", label: "RBCs", unit: "/hpf", type: "text", priority: "high" },
        { key: "urineWbc", label: "Pus Cells", unit: "/hpf", type: "text", priority: "high" },
        { key: "urineEpithelialCells", label: "Epithelial Cells", unit: "/hpf", type: "text", priority: "high" },
        { key: "urineCrystals", label: "Crystals", unit: "", type: "text", priority: "high" },
        { key: "urineBacteria", label: "Bacteria", unit: "", type: "select", options: ["Nil", "Few", "Moderate", "Many"], priority: "high" }
    ],



    // K. SPECIAL PROCEDURES
    "Pap Smear": [{ key: "papSmearResult", label: "Result", type: "textarea", priority: "high" }],
    // ABG
    "ABG": [
        { key: "abgPh", label: "pH", unit: "", type: "number", priority: "high" },
        { key: "abgPo2", label: "pO2", unit: "mmHg", type: "number", priority: "high" },
        { key: "abgPco2", label: "pCO2", unit: "mmHg", type: "number", priority: "high" },
        { key: "abgHco3", label: "HCO3", unit: "mEq/L", type: "number", priority: "high" },
        { key: "abgBaseExcess", label: "Base Excess", unit: "mEq/L", type: "number", priority: "high" },
        { key: "abgSao2", label: "SaO2", unit: "%", type: "number", priority: "high" }
    ],

    // M. MISSING TESTS FROM CATALOG
    // Biochemistry Specifics
    "Blood Glucose (Fasting) - FBS": [{ key: "fastingBloodSugar", label: "Fasting Blood Sugar", unit: "mg/dL", type: "number", priority: "high" }],
    "Blood Glucose (Post Prandial) - PPBS": [{ key: "ppBloodSugar", label: "Post Prandial Blood Sugar", unit: "mg/dL", type: "number", priority: "high" }],
    "Blood Glucose (Random) - RBS": [{ key: "randomBloodSugar", label: "Random Blood Sugar", unit: "mg/dL", type: "number", priority: "high" }],
    "Blood Urea": [{ key: "bloodUrea", label: "Blood Urea", unit: "mg/dL", type: "number", priority: "high" }],
    // Serum Creatinine already exists
    // Uric Acid already exists

    // Serology & Immunology Specifics
    "Blood Grouping & Rh Typing": [
        { key: "bloodGroup", label: "Blood Group", unit: "", type: "select", options: ["A", "B", "AB", "O"], priority: "high" },
        { key: "rhType", label: "Rh Type", unit: "", type: "select", options: ["Positive", "Negative"], priority: "high" }
    ],
    "Widal Test (Slide Method)": [
        { key: "salmonellaTyphiO", label: "Salmonella Typhi 'O'", unit: "", type: "text", priority: "high" },
        { key: "salmonellaTyphiH", label: "Salmonella Typhi 'H'", unit: "", type: "text", priority: "high" },
        { key: "salmonellaParaTyphiAH", label: "S. Para Typhi 'AH'", unit: "", type: "text", priority: "high" },
        { key: "salmonellaParaTyphiBH", label: "S. Para Typhi 'BH'", unit: "", type: "text", priority: "high" },
        { key: "widalImpression", label: "Impression", unit: "", type: "textarea", priority: "high" }
    ],
    "VDRL / RPR": [{ key: "vdrlResult", label: "VDRL / RPR", unit: "", type: "select", options: ["Non-Reactive", "Reactive"], priority: "high" }],
    "HBsAg (Hepatitis B)": [{ key: "hbsagResult", label: "HBsAg", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }],
    "HCV (Hepatitis C)": [{ key: "hcvResult", label: "HCV", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }],
    "HIV I & II (Screening)": [{ key: "hivResult", label: "HIV I & II", unit: "", type: "select", options: ["Non-Reactive", "Reactive"], priority: "high" }],
    "Dengue IgG & IgM": [
        { key: "dengueIgG", label: "Dengue IgG", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "dengueIgM", label: "Dengue IgM", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],
    "Typhoid IgG / IgM": [
        { key: "typhoidIgG", label: "Typhoid IgG", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "typhoidIgM", label: "Typhoid IgM", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],
    "RA Factor (Rheumatoid Factor)": [
        { key: "raFactorResult", label: "Result", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "raFactorValue", label: "Titre", unit: "IU/mL", type: "number", priority: "medium" }
    ],
    "CRP (C-Reactive Protein)": [
        { key: "crpResult", label: "Result", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "crpValue", label: "Value", unit: "mg/L", type: "number", priority: "medium" }
    ],
    "ASO Titre": [
        { key: "asoResult", label: "Result", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" },
        { key: "asoValue", label: "Titre", unit: "IU/mL", type: "number", priority: "medium" }
    ],

    // Hormones
    "Thyroid Stimulating Hormone (TSH)": [{ key: "tshValue", label: "TSH", unit: "µIU/mL", type: "number", priority: "high" }],
    "T3 (Triiodothyronine)": [{ key: "totalT3", label: "Total T3", unit: "ng/dL", type: "number", priority: "high" }],
    "T4 (Thyroxine)": [{ key: "totalT4", label: "Total T4", unit: "µg/dL", type: "number", priority: "high" }],
    "Beta HCG": [{ key: "betaHcgValue", label: "Beta HCG", unit: "mIU/mL", type: "number", priority: "high" }],
    "Prolactin": [{ key: "prolactinValue", label: "Prolactin", unit: "ng/mL", type: "number", priority: "high" }],

    // Microbiology 
    "Culture & Sensitivity (Urine)": [
        { key: "organismName", label: "Organism Isolated", unit: "", type: "text", priority: "high" },
        { key: "colonyCount", label: "Colony Count", unit: "CFU/mL", type: "text", priority: "medium" },
        { key: "antibioticSensitivity", label: "Antibiotic Sensitivity", unit: "", type: "textarea", priority: "high" }
    ],
    "Culture & Sensitivity (Pus/Swab)": [
        { key: "organismName", label: "Organism Isolated", unit: "", type: "text", priority: "high" },
        { key: "pusCells", label: "Pus Cells", unit: "/hpf", type: "text", priority: "medium" },
        { key: "gramStain", label: "Gram Stain", unit: "", type: "text", priority: "medium" },
        { key: "antibioticSensitivity", label: "Antibiotic Sensitivity", unit: "", type: "textarea", priority: "high" }
    ],
    "Mantoux Test": [
        { key: "mantouxInduration", label: "Induration", unit: "mm", type: "number", priority: "high" },
        { key: "mantouxImpression", label: "Impression", unit: "", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],


    "Stool Routine": [
        { key: "stoolColor", label: "Color", unit: "", type: "text", priority: "medium" },
        { key: "stoolConsistency", label: "Consistency", unit: "", type: "select", options: ["Solid", "Semi-solid", "Loose", "Watery"], priority: "medium" },
        { key: "stoolOva", label: "Ova", type: "text", priority: "high" },
        { key: "stoolCyst", label: "Cyst", type: "text", priority: "high" },
        { key: "stoolOccultBlood", label: "Occult Blood", type: "select", options: ["Negative", "Positive"], priority: "high" }
    ],
    "Semen Analysis": [
        { key: "semenVolume", label: "Volume", unit: "mL", type: "number", priority: "high" },
        { key: "semenLiquefactionTime", label: "Liquefaction Time", unit: "min", type: "number", priority: "high" },
        { key: "semenViscosity", label: "Viscosity", unit: "", type: "select", options: ["Normal", "Highly Viscous"], priority: "medium" },
        { key: "totalSpermCount", label: "Total Sperm Count", unit: "mil/mL", type: "number", priority: "high" },
        { key: "activeMotility", label: "Active Motility", unit: "%", type: "number", priority: "high" },
        { key: "sluggishMotility", label: "Sluggish Motility", unit: "%", type: "number", priority: "high" },
        { key: "nonMotile", label: "Non-Motile", unit: "%", type: "number", priority: "high" },
        { key: "semenMorphology", label: "Normal Morphology", unit: "%", type: "number", priority: "high" }
    ],
    "Body Fluid Analysis": [
        { key: "fluidType", label: "Fluid Type", unit: "", type: "select", options: ["CSF", "Pleural", "Ascitic", "Synovial"], priority: "medium" },
        { key: "fluidColor", label: "Color", unit: "", type: "text", priority: "high" },
        { key: "fluidAppearance", label: "Appearance", unit: "", type: "text", priority: "high" },
        { key: "fluidTotalCount", label: "Total Count", unit: "cells/cumm", type: "number", priority: "high" },
        { key: "fluidPolymorphs", label: "Polymorphs", unit: "%", type: "number", priority: "high" },
        { key: "fluidLymphocytes", label: "Lymphocytes", unit: "%", type: "number", priority: "high" },
        { key: "fluidProtein", label: "Protein", unit: "mg/dL", type: "number", priority: "high" },
        { key: "fluidSugar", label: "Sugar", unit: "mg/dL", type: "number", priority: "high" }
    ]
};
