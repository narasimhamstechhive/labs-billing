import Patient from './src/models/Patient.js';
console.log('DEBUG_AGE_TYPE:', Patient.schema.path('age').instance);
process.exit(0);
