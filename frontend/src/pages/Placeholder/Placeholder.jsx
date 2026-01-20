import React from 'react';
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Placeholder = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/').pop().replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center p-6">
            <div className="bg-primary-50 p-6 rounded-full mb-6">
                <Construction className="w-16 h-16 text-primary-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{pageName}</h1>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                This feature module is currently under active development.
                We are building a robust system for <strong>{pageName}</strong> management.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Placeholder;
