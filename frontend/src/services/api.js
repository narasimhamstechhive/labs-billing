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
    getAll: async (params) => {
        const cacheKey = params ? `patients_${JSON.stringify(params)}` : 'patients_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };

        let res;
        if (typeof params === 'string') {
            res = await api.get(`/patients?keyword=${params}`);
        } else {
            res = await api.get('/patients', { params });
        }

        cacheService.set(cacheKey, res.data);
        return res;
    },
    getById: (id) => api.get(`/patients/${id}`),
    create: async (data) => {
        const res = await api.post('/patients', data);
        cacheService.invalidatePattern('patients');
        return res;
    },
    update: async (id, data) => {
        const res = await api.put(`/patients/${id}`, data);
        cacheService.invalidatePattern('patients');
        return res;
    },
    delete: async (id) => {
        const res = await api.delete(`/patients/${id}`);
        cacheService.invalidatePattern('patients');
        return res;
    },
};

// ============================================
// BILLING API
// ============================================
export const billingAPI = {
    // Invoices
    createInvoice: async (data) => {
        const res = await api.post('/billing/create', data);
        cacheService.invalidatePattern('invoices');
        cacheService.invalidatePattern('billing_stats');
        return res;
    },
    getInvoices: async (params) => {
        const cacheKey = params ? `invoices_${JSON.stringify(params)}` : 'invoices_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };

        const res = await api.get('/billing', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },
    deleteInvoice: async (id) => {
        const res = await api.delete(`/billing/${id}`);
        cacheService.invalidatePattern('invoices');
        cacheService.invalidatePattern('billing_stats');
        return res;
    },

    // Stats
    getStats: async (params) => {
        const cacheKey = params ? `billing_stats_${JSON.stringify(params)}` : 'billing_stats_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };
        const res = await api.get('/billing/stats', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },
    getDailyStats: async (params) => {
        const cacheKey = params ? `billing_daily_stats_${JSON.stringify(params)}` : 'billing_daily_stats_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };
        const res = await api.get('/billing/daily-stats', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },

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
    getAll: async (params) => {
        const cacheKey = params ? `samples_${JSON.stringify(params)}` : 'samples_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };
        const res = await api.get('/samples', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },
    getById: (id) => api.get(`/samples/${id}`),
    updateStatus: async (id, data) => {
        const res = await api.put(`/samples/${id}/status`, data);
        cacheService.invalidatePattern('samples');
        cacheService.invalidatePattern('reports');
        return res;
    },
    delete: async (id) => {
        const res = await api.delete(`/samples/${id}`);
        cacheService.invalidatePattern('samples');
        cacheService.invalidatePattern('reports');
        return res;
    },
};

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
    getPending: async (params) => {
        const cacheKey = params ? `reports_pending_${JSON.stringify(params)}` : 'reports_pending_all';
        const cached = cacheService.get(cacheKey);
        if (cached) return { data: cached };
        const res = await api.get('/reports/pending', { params });
        cacheService.set(cacheKey, res.data);
        return res;
    },
    submit: async (data) => {
        const res = await api.post('/reports/submit', data);
        cacheService.invalidatePattern('reports');
        cacheService.invalidatePattern('samples');
        return res;
    },
    approve: async (sampleId) => {
        const res = await api.put(`/reports/approve/${sampleId}`);
        cacheService.invalidatePattern('reports');
        cacheService.invalidatePattern('samples');
        return res;
    },
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
    getAll: async () => {
        const cached = cacheService.get('expenses');
        if (cached) return { data: cached };
        const res = await api.get('/expenses');
        cacheService.set('expenses', res.data);
        return res;
    },
    create: async (data) => {
        const res = await api.post('/expenses', data);
        cacheService.invalidatePattern('expenses');
        return res;
    },
    delete: async (id) => {
        const res = await api.delete(`/expenses/${id}`);
        cacheService.invalidatePattern('expenses');
        return res;
    },
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
