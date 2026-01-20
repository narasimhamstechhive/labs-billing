import axios from 'axios';
import toast from 'react-hot-toast';
import { cacheService } from './cacheService';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request Interceptor: Attach token to every request
api.interceptors.request.use(
    (config) => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                if (parsed && parsed.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`;
                }
            }
        } catch (error) {
            console.error('Error in request interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Keep track of active toasts to prevent duplicates (spam)
let lastToastMessage = '';
let lastToastTime = 0;

const showUniqueToast = (message, type = 'error') => {
    const now = Date.now();
    if (message === lastToastMessage && now - lastToastTime < 3000) return;

    lastToastMessage = message;
    lastToastTime = now;

    if (type === 'error') toast.error(message);
    else toast.success(message);
};

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('userInfo');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // Handle network errors (no response from server)
        if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
            showUniqueToast('Network connection issue. Please check your internet or server status.');
            return Promise.reject(error);
        }

        // Handle server errors
        if (error.response.status >= 500) {
            const message = error.response.data?.message || 'Server is temporarily unavailable. Please try later.';
            showUniqueToast(message);
        } else if (error.response.status === 403) {
            showUniqueToast('Access denied. You do not have permission for this action.');
        } else if (error.response.status === 429) {
            showUniqueToast('Too many requests. Please slow down and wait a moment.');
        }

        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
};

// ============================================
// DEPARTMENTS API
// ============================================
export const departmentsAPI = {
    getAll: async () => {
        const cached = cacheService.get('departments');
        if (cached) return { data: cached };

        const res = await api.get('/departments');
        cacheService.set('departments', res.data);
        return res;
    },
    create: async (data) => {
        const res = await api.post('/departments', data);
        cacheService.invalidate('departments');
        return res;
    },
    update: async (id, data) => {
        const res = await api.put(`/departments/${id}`, data);
        cacheService.invalidate('departments');
        return res;
    },
    delete: async (id) => {
        const res = await api.delete(`/departments/${id}`);
        cacheService.invalidate('departments');
        return res;
    },
};

// ============================================
// TESTS API
// ============================================
export const testsAPI = {
    getAll: async (params) => {
        // Only cache if no search/filter params are present
        const cacheKey = params ? `tests_${JSON.stringify(params)}` : 'tests_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };

        const res = await api.get('/tests', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },
    create: async (data) => {
        const res = await api.post('/tests', data);
        cacheService.clear(); // Clear all tests cache on create
        return res;
    },
    update: async (id, data) => {
        const res = await api.put(`/tests/${id}`, data);
        cacheService.clear(); // Clear all tests cache on update
        return res;
    },
    delete: async (id) => {
        const res = await api.delete(`/tests/${id}`);
        cacheService.clear(); // Clear all tests cache on delete
        return res;
    },
};

// ============================================
// PATIENTS API
// ============================================
export const patientsAPI = {
    getAll: (params) => {
        if (typeof params === 'string') {
            return api.get(`/patients?keyword=${params}`);
        }
        return api.get('/patients', { params });
    },
    getById: (id) => api.get(`/patients/${id}`),
    create: (data) => api.post('/patients', data),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
};

// ============================================
// BILLING API
// ============================================
export const billingAPI = {
    // Invoices
    createInvoice: (data) => api.post('/billing/create', data),
    getInvoices: (params) => api.get('/billing', { params }),
    deleteInvoice: (id) => api.delete(`/billing/${id}`),

    // Stats
    getStats: (params) => api.get('/billing/stats', { params }),
    getDailyStats: (params) => api.get('/billing/daily-stats', { params }),

    // Print/Download
    printInvoice: (id) => api.get(`/billing/print/${id}`, {
        responseType: 'text',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    }),
};

// ============================================
// SAMPLES API
// ============================================
export const samplesAPI = {
    getAll: (params) => api.get('/samples', { params }),
    getById: (id) => api.get(`/samples/${id}`),
    updateStatus: (id, data) => api.put(`/samples/${id}/status`, data),
    delete: (id) => api.delete(`/samples/${id}`),
};

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
    getPending: (params) => api.get('/reports/pending', { params }),
    submit: (data) => api.post('/reports/submit', data),
    approve: (sampleId) => api.put(`/reports/approve/${sampleId}`),
    print: (sampleId) => api.get(`/reports/print/${sampleId}`, {
        responseType: 'text',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    }),
};

// ============================================
// SETTINGS API
// ============================================
export const settingsAPI = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
    uploadLogo: (formData) => api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// ============================================
// EXPENSES API
// ============================================
export const expensesAPI = {
    getAll: () => api.get('/expenses'),
    create: (data) => api.post('/expenses', data),
    delete: (id) => api.delete(`/expenses/${id}`),
};

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
export const login = authAPI.login;
export const register = authAPI.register;

export const getDepartments = departmentsAPI.getAll;
export const createDepartment = departmentsAPI.create;
export const updateDepartment = departmentsAPI.update;
export const deleteDepartment = departmentsAPI.delete;

export const getTests = testsAPI.getAll;
export const createTest = testsAPI.create;
export const updateTest = testsAPI.update;
export const deleteTest = testsAPI.delete;

export const getPatients = patientsAPI.getAll;
export const registerPatient = patientsAPI.create;
export const getPatientById = patientsAPI.getById;
export const deletePatient = patientsAPI.delete;

export const createInvoice = billingAPI.createInvoice;
export const getInvoices = billingAPI.getInvoices;
export const deleteInvoice = billingAPI.deleteInvoice;
export const getBillingStats = billingAPI.getStats;
export const getDailyStats = billingAPI.getDailyStats;

export const getSamples = samplesAPI.getAll;
export const updateSampleStatus = samplesAPI.updateStatus;
export const deleteSample = samplesAPI.delete;

export const getPendingResults = reportsAPI.getPending;
export const submitResults = reportsAPI.submit;
export const approveResults = reportsAPI.approve;
export const printReport = reportsAPI.print;

export const getSettings = settingsAPI.get;
export const updateSettings = settingsAPI.update;
export const uploadLogo = settingsAPI.uploadLogo;

export const getExpenses = expensesAPI.getAll;
export const createExpense = expensesAPI.create;
export const deleteExpense = expensesAPI.delete;

// Export default api instance for direct use if needed
export default api;
