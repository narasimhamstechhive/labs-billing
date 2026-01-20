import React, { useEffect, useState } from 'react';
import { departmentsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Building2, FileText, Search, X, Edit3, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const DepartmentMaster = () => {
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const { data } = await departmentsAPI.getAll();
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments');
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Department name is required');
            return;
        }
        try {
            await departmentsAPI.create({ name: name.trim(), description: description.trim() });
            toast.success('Department created successfully');
            setName('');
            setDescription('');
            fetchDepartments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create department');
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await departmentsAPI.delete(deleteModal.id);
            toast.success('Department deleted successfully');
            fetchDepartments();
            setDeleteModal({ isOpen: false, id: null });
        } catch (err) {
            toast.error('Failed to delete department');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Department Master</h1>
                                <p className="text-gray-600 mt-2 text-lg">Manage and organize your laboratory departments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl border border-blue-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
                                    <div className="text-sm text-blue-600 font-medium">Total Departments</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Add Department Form */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Add New Department</h3>
                                        <p className="text-blue-100 text-sm">Create a new department</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Department Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all bg-gray-50 focus:bg-white"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Haematology, Biochemistry..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none bg-gray-50 focus:bg-white"
                                            rows="4"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief description of the department's focus and services..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Create Department</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Departments List */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Department Directory</h3>
                                            <p className="text-indigo-100 text-sm">Manage existing departments</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-200" />
                                        <input
                                            type="text"
                                            placeholder="Search departments..."
                                            className="pl-10 pr-4 py-2 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 transition-all text-white placeholder-indigo-200"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-200 hover:text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="max-h-[600px] overflow-y-auto">
                                {loading ? (
                                    <div className="p-16 text-center">
                                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-500 font-medium">Loading departments...</p>
                                    </div>
                                ) : filteredDepartments.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                                            <Building2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                            {searchTerm ? 'No departments found' : 'No departments yet'}
                                        </h4>
                                        <p className="text-gray-500">
                                            {searchTerm ? 'Try adjusting your search terms' : 'Create your first department to get started'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredDepartments.map((dept) => (
                                            <div key={dept._id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                            <FileText className="w-6 h-6 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">{dept.name}</h4>
                                                            {dept.description && (
                                                                <p className="text-gray-600 leading-relaxed text-sm">{dept.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(dept._id)}
                                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 hover:scale-110"
                                                        title="Delete department"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Department"
                message="Are you sure you want to delete this department? This will permanentely remove the department and may affect linked tests."
                loading={isDeleting}
            />
        </div>
    );
};

export default DepartmentMaster;
