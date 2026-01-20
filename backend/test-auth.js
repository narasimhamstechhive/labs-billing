// Simple test script to create user and test login
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
    try {
        console.log('1. Creating admin user...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            name: 'Admin User',
            email: 'admin@medilab.com',
            password: 'admin123',
            role: 'admin',
            mobile: '9876543210'
        });
        console.log('✅ User created successfully!');
        console.log('Response:', registerResponse.data);
        console.log('\n');

        console.log('2. Testing login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@medilab.com',
            password: 'admin123'
        });
        console.log('✅ Login successful!');
        console.log('Response:', loginResponse.data);
        console.log('\n');

        console.log('3. Testing protected route with token...');
        const token = loginResponse.data.token;
        const patientsResponse = await axios.get(`${BASE_URL}/patients`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('✅ Protected route works!');
        console.log('Patients:', patientsResponse.data);

    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.data.message);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testAuth();
