import React, { useState, useEffect } from 'react';
import { patientsAPI, billingAPI } from '../../services/api';
import { Search, User, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PatientForm from '../../components/PatientForm';

const PatientRegistration = () => {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        name: '', age: '', ageMonths: '', gender: 'Male', mobile: '', email: '', address: '', referringDoctor: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit] = useState(8);

    const handlePrint = async (patient) => {
        const toastId = toast.loading('Finding invoice...');
        try {
            const { data } = await billingAPI.getInvoices({ patientId: patient._id, limit: 1 });
            if (data.invoices && data.invoices.length > 0) {
                const invoiceId = data.invoices[0]._id;

                // Use centralized API service
                const response = await billingAPI.printInvoice(invoiceId);

                // Check if response is HTML
                if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                        toast.dismiss(toastId);
                        toast.error('Please allow popups to print invoices', { id: toastId });
                        return;
                    }

                    printWindow.document.open();
                    printWindow.document.write(response.data);
                    printWindow.document.close();

                    toast.dismiss(toastId);
                    toast.success('Invoice opened in new tab', { id: toastId });

                    // Auto print after content loads
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                } else {
                    throw new Error('Invalid response format. Expected HTML.');
                }
            } else {
                toast.dismiss(toastId);
                toast.error('No invoice found for this patient', { id: toastId });
            }
        } catch (error) {
            console.error('Print error:', error);
            toast.dismiss(toastId);
            toast.error(error.message || 'Failed to fetch invoice', { id: toastId });
        }
    };

    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                    error = 'Only letters are allowed';
                }
                break;
            case 'age':
                if (value !== '' && !/^\d+$/.test(value)) {
                    error = 'Age must be a whole number';
                }
                break;
            case 'ageMonths':
                if (value !== '' && (!/^\d+$/.test(value) || parseInt(value) > 11)) {
                    error = 'Months must be between 0 and 11';
                }
                break;
            case 'mobile':
                if (value && !/^\d{10}$/.test(value)) {
                    error = 'Phone number must be exactly 10 digits';
                }
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'referringDoctor':
                if (value && !/^[a-zA-Z\s.]+$/.test(value)) {
                    error = 'Doctor name must contain only letters';
                }
                break;
            default:
                break;
        }
        setFieldErrors(prev => {
            if (error) return { ...prev, [name]: error };
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
        return error;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setPage(1);
        fetchPatients(search, 1);
    };

    const fetchPatients = async (keyword = search, pageNum = page) => {
        setLoading(true);
        try {
            const { data } = await patientsAPI.getAll({ keyword, page: pageNum, limit });
            setPatients(data.patients || []);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch patients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [page]);

    // Reset pagination when search changes (handled in handleSearch or debounced effect)

    // Debounced Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search.length >= 2 || search.length === 0) {
                setPage(1);
                fetchPatients(search, 1);
            }
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleChange = (e) => {
        let { name, value } = e.target;
        let blockUpdate = false;
        let currentError = '';

        // 1. Filter restricted characters
        if (name === 'name' || name === 'referringDoctor') {
            const allowedRegex = name === 'name' ? /[^a-zA-Z\s]/g : /[^a-zA-Z\s.]/g;
            const filteredValue = value.replace(allowedRegex, '');
            if (filteredValue !== value) {
                currentError = name === 'name' ? 'Only letters are allowed' : 'Doctor name must contain only letters';
                value = filteredValue;
            }
        } else if (name === 'age' || name === 'ageMonths' || name === 'mobile') {
            const filteredValue = value.replace(/\D/g, '');
            if (filteredValue !== value) {
                currentError = name === 'age' ? 'Age must be a whole number' :
                    name === 'ageMonths' ? 'Months must be between 0 and 11' :
                        'Phone number must be exactly 10 digits';
                value = filteredValue;
            }

            // 2. Range/Length blocking
            if (name === 'ageMonths' && value !== '' && parseInt(value) > 11) {
                currentError = 'Months must be between 0 and 11';
                blockUpdate = true;
            } else if (name === 'mobile' && value.length > 10) {
                blockUpdate = true;
            }
        }

        // 3. Update State and Errors
        if (!blockUpdate) {
            setFormData(prev => ({ ...prev, [name]: value }));
            const validationError = validateField(name, value);
            if (currentError && !validationError) {
                setFieldErrors(prev => ({ ...prev, [name]: currentError }));
            }
        } else if (currentError) {
            setFieldErrors(prev => ({ ...prev, [name]: currentError }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Final validation check
        const errors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) errors[key] = error;
        });

        if (Object.keys(errors).length > 0) {
            toast.error(errors[Object.keys(errors)[0]]);
            const firstErrorKey = Object.keys(errors)[0];
            const element = document.getElementsByName(firstErrorKey)[0];
            if (element) element.focus();
            return;
        }

        setLoading(true);

        try {
            const postData = { ...formData };

            // Refined age formatting
            const years = parseInt(postData.age) || 0;
            const months = parseInt(postData.ageMonths) || 0;

            if (years === 0 && months > 0) {
                postData.age = `${months} Months`;
            } else if (years > 0 && months > 0) {
                postData.age = `${years} Years ${months} Months`;
            } else if (years > 0) {
                postData.age = `${years} Years`;
            } else {
                postData.age = "0 Years"; // Fallback
            }

            delete postData.ageMonths;

            const { data } = await patientsAPI.create(postData);
            toast.success(`Patient registered successfully! ID: ${data.patientId}`);
            setFormData({ name: '', age: '', ageMonths: '', gender: 'Male', mobile: '', email: '', address: '', referringDoctor: '' });
            setFieldErrors({});
            fetchPatients();
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration Failed.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patient Registration</h1>
                                <p className="text-gray-600 mt-2 text-lg">Register new patients and manage patient records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{patients.length}</div>
                                    <div className="text-sm text-emerald-600 font-medium">Total Patients</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-emerald-400" />
                            <input
                                type="text"
                                placeholder="Search by Name, Mobile, or Patient ID"
                                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all bg-gray-50 focus:bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-3"
                        >
                            <Search className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Registration Form */}
                    <div className="xl:col-span-1">
                        <PatientForm
                            formData={formData}
                            handleChange={handleChange}
                            handleRegister={handleRegister}
                            fieldErrors={fieldErrors}
                            loading={loading}
                        />
                    </div>

                    {/* Patient List */}
                    <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Patient Directory</h3>
                                    <p className="text-teal-100 text-sm">Manage registered patients</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col">
                            <div className="flex-1 overflow-y-auto pr-2 relative scroll-hide" style={{ maxHeight: '500px' }}>
                                <table className="table w-full">
                                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                        <tr>
                                            <th className="py-3 text-left">Patient ID</th>
                                            <th className="py-3 text-left">Name</th>
                                            <th className="py-3 text-left">Age/Gender</th>
                                            <th className="py-3 text-left">Mobile</th>
                                            <th className="py-3 text-left">Doctor</th>
                                            <th className="py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map(patient => (
                                            <tr key={patient._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                                <td>
                                                    <span className="font-mono text-sm font-semibold text-teal-600">
                                                        {patient.patientId}
                                                    </span>
                                                </td>
                                                <td className="font-medium text-gray-900">{patient.name}</td>
                                                <td className="text-gray-600">
                                                    {patient.age} / {patient.gender.charAt(0)}
                                                </td>
                                                <td className="text-gray-600">{patient.mobile}</td>
                                                <td className="text-gray-600">{patient.referringDoctor || '-'}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePrint(patient)}
                                                            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
                                                            title="Print Patient Invoice"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {patients.length === 0 && !loading && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                                                        <User className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h4>
                                                    <p className="text-gray-500">Register your first patient to get started</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {pages > 1 && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{pages}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1 || loading}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                        </button>

                                        {/* Pagination Numbers Logic */}
                                        {(() => {
                                            let buttons = [];
                                            // Show max 5 page buttons to keep it clean
                                            const maxButtons = 5;
                                            let start = Math.max(1, page - 2);
                                            let end = Math.min(start + maxButtons - 1, pages);

                                            // Adjust start if end is too close to limit
                                            if (end - start + 1 < maxButtons) {
                                                start = Math.max(1, end - maxButtons + 1);
                                            }

                                            for (let i = start; i <= end; i++) {
                                                buttons.push(
                                                    <button
                                                        key={i}
                                                        onClick={() => setPage(i)}
                                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === i
                                                            ? 'bg-emerald-600 text-white shadow-sm'
                                                            : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                                            }`}
                                                    >
                                                        {i}
                                                    </button>
                                                );
                                            }
                                            return buttons;
                                        })()}

                                        <button
                                            onClick={() => setPage(p => Math.min(pages, p + 1))}
                                            disabled={page === pages || loading}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRegistration;
