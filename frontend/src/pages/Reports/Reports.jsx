import React, { useEffect, useState } from 'react';
import { samplesAPI, reportsAPI } from '../../services/api';
import { FileCheck, Download, CheckCircle, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('userInfo')));
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    const fetchReports = async (pageNum = page) => {
        setLoading(true);
        try {
            const { data } = await samplesAPI.getAll({
                status: 'Processing,Approved',
                page: pageNum,
                limit
            });
            setReports(data.samples || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [page]);

    const handleApprove = async (id) => {
        try {
            await reportsAPI.approve(id);
            toast.success('Report Approved');
            fetchReports();
        } catch (err) {
            toast.error('Approval Failed');
        }
    };

    const handleDelete = (id) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await samplesAPI.delete(deleteModal.id);
            toast.success('Report deleted successfully');
            setDeleteModal({ isOpen: false, id: null });
            fetchReports();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to delete report');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async (sample) => {
        try {
            const response = await reportsAPI.print(sample._id);

            // Check if response is HTML
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                // Create a visible window to show the report
                const printWindow = window.open('', '_blank', 'width=800,height=900');
                if (!printWindow) {
                    throw new Error('Please allow popups to view reports');
                }

                // Write the report HTML
                printWindow.document.open();
                printWindow.document.write(response.data);

                // Inject Download Button and Script logic
                const downloadScript = `
                    <div style="text-align: center; margin: 20px 0; padding: 20px;" class="no-print">
                        <button id="downloadReportBtn" style="
                            background: #2563eb; color: white; border: none; padding: 12px 30px;
                            font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s;
                        ">
                            📥 Download Report PDF
                        </button>
                    </div>
                    <script>
                        const btn = document.getElementById('downloadReportBtn');
                        btn.addEventListener('click', async () => {
                            btn.disabled = true;
                            btn.textContent = '⏳ Generating PDF...';
                            btn.style.background = '#6b7280';
                            
                            try {
                                const script = document.createElement('script');
                                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                                document.head.appendChild(script);
                                
                                await new Promise(resolve => script.onload = resolve);
                                
                                const element = document.body;
                                const opt = {
                                    margin: [10, 10, 10, 10],
                                    filename: 'report-${sample.sampleId}.pdf',
                                    image: { type: 'jpeg', quality: 0.98 },
                                    html2canvas: { scale: 2, useCORS: true, logging: false },
                                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                };
                                
                                // Hide button for PDF generation
                                const btnDiv = document.querySelector('.no-print');
                                btnDiv.style.display = 'none';
                                
                                await html2pdf().set(opt).from(element).save();
                                
                                // Show button again
                                btnDiv.style.display = 'block';
                                btn.textContent = '✅ Downloaded!';
                                btn.style.background = '#10b981';
                                setTimeout(() => {
                                    btn.disabled = false;
                                    btn.textContent = '📥 Download Report PDF';
                                    btn.style.background = '#2563eb';
                                }, 2000);
                            } catch (error) {
                                console.error(error);
                                alert('Failed to generate PDF');
                                btn.disabled = false;
                                btn.textContent = '❌ Error';
                            }
                        });
                    </script>
                `;

                printWindow.document.write(downloadScript);
                printWindow.document.close();
            } else {
                throw new Error('Invalid response format. Expected HTML.');
            }
        } catch (err) {
            console.error('Download error:', err);
            toast.error(err.message || 'Failed to download report');
        }
    };

    const getStatusColor = (status) => {
        return status === 'Approved'
            ? 'bg-success-100 text-success-700 border-success-200'
            : 'bg-warning-100 text-warning-700 border-warning-200';
    };

    const isAdmin = user.role === 'admin';
    const canApprove = isAdmin || user.role === 'pathologist';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Approval</h1>
                    <p className="text-gray-500 mt-1">Review and approve test reports</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg">
                    <FileCheck className="w-5 h-5" />
                    <span className="font-semibold">{total}</span>
                    <span className="text-sm">Total Reports</span>
                </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Sample ID</th>
                                <th>Patient</th>
                                <th>Tests</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50' : ''}>
                            {reports.map(r => (
                                <tr key={r._id}>
                                    <td>
                                        <span className="font-mono text-sm font-semibold text-primary-600">
                                            {r.sampleId}
                                        </span>
                                    </td>
                                    <td>
                                        <div>
                                            <p className="font-medium text-gray-900">{r.patient?.name}</p>
                                            <p className="text-xs text-gray-500">{r.patient?.patientId}</p>
                                        </div>
                                    </td>
                                    <td className="text-sm text-gray-600 max-w-xs truncate">
                                        {r.tests?.map(t => t.testName).join(', ')}
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="text-sm text-gray-600">
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            {r.status === 'Processing' && canApprove && (
                                                <button
                                                    onClick={() => handleApprove(r._id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-600 to-success-500 text-white rounded-lg text-sm font-medium hover:from-success-700 hover:to-success-600 transition-all shadow-soft"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Approve</span>
                                                </button>
                                            )}
                                            {r.status === 'Approved' && (
                                                <button
                                                    onClick={() => handleDownload(r)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-soft"
                                                >
                                                    <Download className="w-4 h-4" />

                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(r._id)}
                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12">
                                        <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No reports found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
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
                            {[...Array(pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                        ? 'bg-primary-600 text-white shadow-soft'
                                        : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
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

            {!canApprove && (
                <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                    <p className="text-sm text-warning-700">
                        <strong>Note:</strong> Only Pathologists and Admins can approve reports.
                    </p>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Report"
                message="Are you sure you want to delete this report? This will also delete all test results associated with it and cannot be undone."
                loading={isDeleting}
            />
        </div>
    );
};

export default Reports;
