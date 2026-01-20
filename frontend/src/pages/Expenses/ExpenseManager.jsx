import React, { useState, useMemo, useEffect } from 'react';
import { expensesAPI } from '../../services/api';
import {
    DollarSign,
    Plus,
    Calendar,
    Search,
    Filter,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
    Trash2,
    Eye
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

// Lab-Specific Expense Categories Configuration
const EXPENSE_CATEGORIES = {
    'Test-Related': [
        'Reagents & Chemicals',
        'Test Kits (CBC, LFT, etc.)',
        'Sample Collection Materials',
        'Slides, Stains & Consumables'
    ],
    'Equipment': [
        'Analyzer Purchase',
        'AMC (Annual Maintenance)',
        'Calibration Costs',
        'Spare Parts',
        'Repairs & Servicing'
    ],
    'Staff': [
        'Lab Technician Salary',
        'Pathologist Fees',
        'Collection Staff Salary',
        'Reception/Admin Salary',
        'Overtime & Incentives'
    ],
    'Operational': [
        'Electricity Bill',
        'Water Bill',
        'Internet & Telephone',
        'Rent',
        'Generator Fuel',
        'Housekeeping & Waste Disposal'
    ],
    'Administrative': [
        'Software Subscription',
        'Printing & Stationery',
        'Courier Charges',
        'Marketing & Ads',
        'Office Supplies'
    ],
    'External Services': [
        'Outsourced Test Charges',
        'Referral Lab Payments',
        'Home Collection Partners',
        'Doctor Commissions'
    ]
};

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'];

const ExpenseManager = () => {
    // --- State Management ---
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const { data } = await expensesAPI.getAll();
            setExpenses(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        subCategory: '',
        description: '',
        amount: '',
        paymentMode: 'Cash',
        status: 'Paid',
        vendor: '',
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    // Get current user
    const currentUser = useMemo(() => {
        try {
            const user = JSON.parse(localStorage.getItem('userInfo'));
            return user?.name || 'Admin';
        } catch (e) {
            return 'Admin';
        }
    }, []);

    // --- Statistics Calculations ---
    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return expenses.reduce((acc, curr) => {
            const amt = Number(curr.amount) || 0;
            const expenseDate = new Date(curr.date);

            // Total Pending
            if (curr.status === 'Pending') {
                acc.pendingAmount += amt;
                acc.pendingCount += 1;
            }

            // Today's Expense
            if (curr.date === today) {
                acc.todayAmount += amt;
            }

            // This Month's Expense
            if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
                acc.monthAmount += amt;
            }

            // Category Breakdown (for Top Category)
            acc.categories[curr.category] = (acc.categories[curr.category] || 0) + amt;

            return acc;
        }, {
            todayAmount: 0,
            monthAmount: 0,
            pendingAmount: 0,
            pendingCount: 0,
            categories: {}
        });
    }, [expenses]);

    const topCategory = useMemo(() => {
        const cats = stats.categories;
        if (Object.keys(cats).length === 0) return { name: 'N/A', amount: 0 };
        const top = Object.keys(cats).reduce((a, b) => cats[a] > cats[b] ? a : b);
        return { name: top, amount: cats[top] };
    }, [stats]);

    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset subCategory if category changes
            ...(name === 'category' ? { subCategory: '' } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newExpenseEntry = {
                ...formData,
                amount: Number(formData.amount),
                enteredBy: currentUser
            };

            await expensesAPI.create(newExpenseEntry);
            toast.success('Expense Added Successfully');
            setShowAddModal(false);
            fetchExpenses(); // Refresh list

            // Reset form but keep date as today
            setFormData({
                category: '',
                subCategory: '',
                description: '',
                amount: '',
                paymentMode: 'Cash',
                status: 'Paid',
                vendor: '',
                invoiceNumber: '',
                date: new Date().toISOString().split('T')[0],
                remarks: ''
            });
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add expense');
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await expensesAPI.delete(deleteModal.id);
            toast.success('Expense deleted');
            fetchExpenses();
            setDeleteModal({ isOpen: false, id: null });
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete expense');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Filtered Data ---
    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? exp.date === filterDate : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-rose-600" />
                        Lab Expense Manager
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Track operational costs, purchases, and staff payments</p>
                </div>
                <div className="flex gap-3">
                    {/* <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Report
                    </button> */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Expense
                    </button>
                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-rose-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Expenses</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">₹{stats.todayAmount.toLocaleString()}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> Daily Total
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Month</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">₹{stats.monthAmount.toLocaleString()}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" /> Monthly Running
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-amber-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Payments</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-1">₹{stats.pendingAmount.toLocaleString()}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5" /> {stats.pendingCount} Bills Unpaid
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-indigo-100 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Top Spend Category</p>
                        <h3 className="text-xl font-black text-gray-900 mt-1 truncate" title={topCategory.name}>{topCategory.name}</h3>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3.5 h-3.5" /> ₹{topCategory.amount.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Filters Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by description, vendor, or category..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full md:w-40 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-rose-500"
                            />
                        </div>
                        {filterDate && (
                            <button
                                onClick={() => setFilterDate('')}
                                className="text-sm font-bold text-rose-600 hover:text-rose-700"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor / Invoice</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-rose-50/10 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-700">{new Date(expense.date).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{expense.description}</p>
                                            {expense.remarks && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{expense.remarks}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-700">{expense.category}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">{expense.subCategory}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold border w-fit
                                                    ${expense.status === 'Paid'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'}`
                                                }>
                                                    {expense.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {expense.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium ml-1">{expense.paymentMode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">{expense.vendor || '-'}</span>
                                                {expense.invoiceNumber && (
                                                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                                                        #{expense.invoiceNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <span className="text-lg font-black text-gray-900">₹{expense.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Expense"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">No Expenses Found</h3>
                                            <p className="text-gray-500 max-w-sm mt-1 mb-6">
                                                {searchTerm || filterDate ? 'Try adjusting your filters.' : 'Start tracking your lab expenses by adding a new record.'}
                                            </p>
                                            {!searchTerm && !filterDate && (
                                                <button
                                                    onClick={() => setShowAddModal(true)}
                                                    className="px-5 py-2.5 bg-rose-600/10 text-rose-700 font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                                >
                                                    Add First Expense
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 scrollbar-hide">
                        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-xl text-gray-900">New Expense Entry</h3>
                                <p className="text-xs font-medium text-gray-500">Recorded by: <span className="text-rose-600">{currentUser}</span></p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Category & Sub-Category */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expense Category <span className="text-rose-500">*</span></label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(EXPENSE_CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Sub-Category <span className="text-rose-500">*</span></label>
                                    <select
                                        name="subCategory"
                                        required
                                        disabled={!formData.category}
                                        value={formData.subCategory}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Select Details</option>
                                        {formData.category && EXPENSE_CATEGORIES[formData.category].map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description & Amount */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Description / Item Name <span className="text-rose-500">*</span></label>
                                    <input
                                        name="description"
                                        required
                                        placeholder="e.g. Glucose Kit (5x100ml)"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Amount (₹) <span className="text-rose-500">*</span></label>
                                    <input
                                        name="amount"
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-base font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Mode</label>
                                    <select
                                        name="paymentMode"
                                        value={formData.paymentMode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                                    >
                                        {PAYMENT_MODES.map(mode => (
                                            <option key={mode} value={mode}>{mode}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Payment Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white ${formData.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                                            }`}
                                    >
                                        <option value="Paid">Paid Fully</option>
                                        <option value="Pending">Payment Pending</option>
                                    </select>
                                </div>
                            </div>

                            {/* Vendor & Invoice Info (Optional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                        Vendor / Supplier Name
                                        <span className="text-[10px] text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <input
                                        name="vendor"
                                        placeholder="e.g. MedPlus Pharma"
                                        value={formData.vendor}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                        Invoice / Bill No.
                                        <span className="text-[10px] text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <input
                                        name="invoiceNumber"
                                        placeholder="e.g. INV-2024-001"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                            </div>

                            {/* Date & Remarks */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expense Date <span className="text-rose-500">*</span></label>
                                    <input
                                        name="date"
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex justify-between">
                                        Remarks / Notes
                                        <span className="text-[10px] text-gray-400 font-normal normal-case">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="remarks"
                                        rows="1"
                                        placeholder="Any additional details..."
                                        value={formData.remarks}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 min-h-[46px]"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex items-center gap-3 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold rounded-xl hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-200 transition-all active:scale-95"
                                >
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Expense"
                message="Are you sure you want to delete this expense entry? This action cannot be undone."
                loading={isDeleting}
            />
        </div>
    );
};

export default ExpenseManager;
