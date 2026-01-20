import React, { useEffect, useState } from 'react';
import { testsAPI, departmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Edit, AlertTriangle } from 'lucide-react';

const TestMaster = () => {
    const [tests, setTests] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit] = useState(50);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTest, setEditingTest] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formData, setFormData] = useState({
        testName: '',
        department: '',
        sampleType: '',
        unit: '',
        method: '',
        price: '',
        tat: '',
        normalRanges: {
            male: { min: '', max: '' },
            female: { min: '', max: '' },
            child: { min: '', max: '' },
            general: ''
        }
    });

    const fetchData = async (pageNum = page) => {
        try {
            const [testsRes, deptsRes] = await Promise.all([
                testsAPI.getAll({ page: pageNum, limit }),
                departmentsAPI.getAll()
            ]);
            setTests(testsRes.data.tests || []);
            setPages(testsRes.data.pages || 1);
            setPage(testsRes.data.page || 1);
            setDepartments(deptsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child, sub] = name.split('.');
            if (sub) {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent][child],
                            [sub]: value
                        }
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleRangeChange = (category, type, value) => {
        setFormData(prev => ({
            ...prev,
            normalRanges: {
                ...prev.normalRanges,
                [category]: {
                    ...prev.normalRanges[category],
                    [type]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTest) {
                await testsAPI.update(editingTest._id, formData);
                toast.success('Test updated successfully');
            } else {
                await testsAPI.create(formData);
                toast.success('Test created successfully');
            }
            setShowModal(false);
            setEditingTest(null);
            setFormData({ // Reset
                testName: '', department: '', sampleType: '', unit: '', method: '', price: '', tat: '',
                normalRanges: { male: { min: '', max: '' }, female: { min: '', max: '' }, child: { min: '', max: '' }, general: '' }
            });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save test');
        }
    };

    const handleEdit = (test) => {
        setEditingTest(test);
        setFormData({
            testName: test.testName || '',
            department: test.department?._id || test.department || '',
            sampleType: test.sampleType || '',
            unit: test.unit || '',
            method: test.method || '',
            price: test.price || '',
            tat: test.tat || '',
            normalRanges: {
                male: { min: test.normalRanges?.male?.min || '', max: test.normalRanges?.male?.max || '' },
                female: { min: test.normalRanges?.female?.min || '', max: test.normalRanges?.female?.max || '' },
                child: { min: test.normalRanges?.child?.min || '', max: test.normalRanges?.child?.max || '' },
                general: test.normalRanges?.general || ''
            }
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await testsAPI.delete(itemToDelete);
            toast.success('Test deleted successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete test');
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Test Master</h1>
                        <p className="text-gray-500 mt-1">Manage laboratory tests and prices</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTest(null);
                            setFormData({
                                testName: '', department: '', sampleType: '', unit: '', method: '', price: '', tat: '',
                                normalRanges: { male: { min: '', max: '' }, female: { min: '', max: '' }, child: { min: '', max: '' }, general: '' }
                            });
                            setShowModal(true);
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <span>+ Add New Test</span>
                    </button>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sample</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tests.map((test) => (
                                    <tr key={test._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{test.testName}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {test.department?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{test.sampleType}</td>
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">₹{test.price}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(test)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {tests.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No tests found. Add a new test to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-medium">Page {page} of {pages}</span>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page === pages}
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">{editingTest ? 'Edit Test' : 'Add New Test'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="testForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Test Name</label>
                                        <input
                                            name="testName"
                                            value={formData.testName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. CBC"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Department</label>
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Sample Type</label>
                                        <input
                                            name="sampleType"
                                            value={formData.sampleType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Blood"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                                        <input
                                            name="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Unit</label>
                                        <input
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. mg/dL"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Method</label>
                                        <input
                                            name="method"
                                            value={formData.method}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. ELISA"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Turnaround Time</label>
                                        <input
                                            name="tat"
                                            value={formData.tat}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. 24 Hours"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Normal Ranges</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['male', 'female', 'child'].map((type) => (
                                            <div key={type} className="bg-gray-50 p-4 rounded-xl space-y-3">
                                                <p className="font-semibold text-gray-700 capitalize text-center">{type}</p>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 mb-1 block">Min</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            value={formData.normalRanges[type].min}
                                                            onChange={(e) => handleRangeChange(type, 'min', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-500 mb-1 block">Max</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                                            value={formData.normalRanges[type].max}
                                                            onChange={(e) => handleRangeChange(type, 'max', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="testForm"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                            >
                                {editingTest ? 'Update Test' : 'Save Test'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Test?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete this test? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/20"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestMaster;
