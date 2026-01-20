import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Icon */}
                <div className="p-8 pb-0 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Confirm Deletion'}</h2>
                    <p className="text-gray-500 font-medium px-4">
                        {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
                    </p>
                </div>

                {/* Actions */}
                <div className="p-8 flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <span>Delete Record</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold text-sm transition-all shadow-sm"
                    >
                        Cancel
                    </button>
                </div>

                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
