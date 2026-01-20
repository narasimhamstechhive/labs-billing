const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log('🚀 Starting Sanity Tests...');

    try {
        // 1. Health Check
        const healthRes = await fetch('http://localhost:5000/');
        const healthData = await healthRes.text();
        console.log('✅ Backend Health Check:', healthData);

        // 2. Login as Admin
        console.log('🔑 Attempting Admin Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@medilab.com',
                password: 'admin123'
            })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');

        const token = loginData.token;
        console.log('✅ Admin Logged In Successfully');

        const authHeader = { Authorization: `Bearer ${token}` };

        // 3. Check Departments
        const deptsRes = await fetch(`${BASE_URL}/departments`, { headers: authHeader });
        const deptsData = await deptsRes.json();
        console.log(`✅ Departments Found: ${deptsData.length}`);

        // 4. Check Patients
        const patientsRes = await fetch(`${BASE_URL}/patients`, { headers: authHeader });
        const patientsData = await patientsRes.json();
        console.log(`✅ Patients Found: ${patientsData.patients?.length || 0}`);

        // 5. Check Expenses (New Feature)
        const expensesRes = await fetch(`${BASE_URL}/expenses`, { headers: authHeader });
        const expensesData = await expensesRes.json();
        if (!expensesRes.ok) throw new Error(expensesData.message || 'Expenses fetch failed');
        console.log(`✅ Expenses Found: ${expensesData.length}`);

        console.log('\n✨ All Sanity Tests Passed!');
    } catch (error) {
        console.error('\n❌ Test Failed!');
        console.error('Error:', error.message);
        process.exit(1);
    }
};

runTests();
