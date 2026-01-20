import React, { useState, useEffect } from 'react';
import { Save, Upload, Building2, MapPin, Phone, Mail, FileText, ShieldCheck, Settings as SettingsIcon, AlertCircle, Eye, X } from 'lucide-react';
import { getSettings, updateSettings, uploadLogo } from '../../services/api';

const Settings = () => {
    const [formData, setFormData] = useState({
        labName: '',
        businessName: '',
        address: '',
        mobile: '',
        email: '',
        gstNumber: '',
        termsAndConditions: '',
        logo: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await getSettings();
            setFormData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings' });
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.labName.trim()) newErrors.labName = 'Lab name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        // Mobile validation (10 digits)
        if (!formData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Enter a valid 10-digit mobile number';
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'labName') {
            // Restrict numbers in lab name
            newValue = value.replace(/[0-9]/g, '');
        }

        if (name === 'mobile') {
            // Restrict to digits only and max 10 characters
            newValue = value.replace(/\D/g, '').slice(0, 10);
        }

        if (name === 'gstNumber') {
            // Restrict to 15 characters, usually alphanumeric
            newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
        }

        setFormData({ ...formData, [name]: newValue });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // basic client-side check


        const uploadFormData = new FormData();
        uploadFormData.append('logo', file);

        try {
            setSaving(true);
            const response = await uploadLogo(uploadFormData);
            setFormData({ ...formData, logo: response.data.filePath });
            setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            setMessage({ type: 'error', text: 'Failed to upload logo' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setMessage({ type: 'error', text: 'Please fix the errors in the form' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await updateSettings(formData);
            setMessage({ type: 'success', text: 'Settings updated successfully!' });
            // Clear cache and notify other components
            sessionStorage.removeItem('labSettings');
            window.dispatchEvent(new CustomEvent('settingsUpdated'));
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    // Reusable Preview Component
    const LetterheadPreview = ({ fullSize = false }) => (
        <div className={`bg-white border border-gray-100 shadow-sm flex flex-col relative overflow-hidden ${fullSize ? 'w-[210mm] min-h-[297mm] p-12 mx-auto scale-100' : 'w-full aspect-[1/1.4] p-4 text-[6px] select-none pointer-events-none'}`}>
            {/* Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Header */}
            <div className={`border-b-2 border-primary-600 flex justify-between items-start gap-4 ${fullSize ? 'pb-6 mb-8 h-40' : 'pb-2 mb-2 h-20'}`}>
                {formData.logo ? (
                    <img
                        src={`http://127.0.0.1:5000${formData.logo}`}
                        className={`${fullSize ? 'h-32 w-32' : 'h-12 w-12'} object-contain`}
                        alt="Lab Logo"
                    />
                ) : (
                    <div className={`${fullSize ? 'h-32 w-32' : 'h-12 w-12'} bg-gray-50 rounded flex items-center justify-center text-gray-300 font-bold uppercase text-[10px]`}>
                        No Logo
                    </div>
                )}

                <div className="text-right flex-1">
                    <h1 className={`font-black text-primary-700 uppercase tracking-tight leading-none ${fullSize ? 'text-4xl mb-2' : 'text-[10px] mb-0.5'}`}>
                        {formData.labName || 'LABORATORY NAME'}
                    </h1>
                    <h2 className={`font-semibold text-gray-500 uppercase tracking-wide leading-tight ${fullSize ? 'text-sm mb-4' : 'text-[6px] mb-1'}`}>
                        {formData.businessName || ''}
                    </h2>
                    <p className={`text-gray-600 leading-snug whitespace-pre-line ${fullSize ? 'text-sm' : 'text-[6px]'}`}>
                        {formData.address || '123 Medical Plaza, Health District\nCity, State - 500001'}
                    </p>
                    <div className={`text-gray-500 font-medium mt-1 ${fullSize ? 'text-sm' : 'text-[6px]'}`}>
                        {formData.mobile && <span>Ph: {formData.mobile} </span>}
                        {formData.email && <span>| {formData.email}</span>}
                    </div>
                </div>
            </div>

            {/* Dummy Patient Banner */}
            <div className={`bg-gray-50 border-y border-gray-200 flex justify-between ${fullSize ? 'p-4 mb-8 text-sm' : 'p-1.5 mb-2 text-[6px]'}`}>
                <div className="space-y-1">
                    <p><span className="font-bold text-gray-500 uppercase">Patient:</span> <span className="font-bold text-gray-900">John Doe</span></p>
                    <p><span className="font-bold text-gray-500 uppercase">Age/Sex:</span> 34 Y / Male</p>
                </div>
                <div className="space-y-1 text-right">
                    <p><span className="font-bold text-gray-500 uppercase">Sample ID:</span> <span className="font-mono text-gray-900">SID-2024-001</span></p>
                    <p><span className="font-bold text-gray-500 uppercase">Date:</span> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Content Body Placeholder */}
            <div className="flex-1">
                <div className={`font-bold text-center text-gray-900 uppercase border-b border-gray-200 ${fullSize ? 'text-lg mb-4 pb-2' : 'text-[8px] mb-1 pb-0.5'}`}>
                    Test Report
                </div>
                {/* Dummy Table Header */}
                <div className={`grid grid-cols-4 font-bold text-gray-500 uppercase border-b border-gray-200 ${fullSize ? 'text-xs py-2 mb-4' : 'text-[5px] py-0.5 mb-1'}`}>
                    <div className="col-span-1">Test Name</div>
                    <div className="col-span-1 text-center">Result</div>
                    <div className="col-span-1 text-center">Units</div>
                    <div className="col-span-1 text-right">Reference Range</div>
                </div>
                {/* Dummy Rows */}
                <div className="space-y-2 opacity-30">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-1/3 h-2 bg-gray-100 rounded"></div>
                            <div className="w-1/6 h-2 bg-gray-100 rounded"></div>
                            <div className="w-1/6 h-2 bg-gray-100 rounded"></div>
                            <div className="w-1/3 h-2 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className={`border-t border-gray-200 text-center text-gray-400 mt-auto ${fullSize ? 'pt-4 text-xs' : 'pt-1 text-[5px]'}`}>
                <p className="font-medium italic mb-1">{formData.termsAndConditions || 'Report generated electronically.'}</p>
                <div className="flex justify-between items-end opacity-50">
                    <span>Generated by {formData.labName}</span>
                    <span>Page 1 of 1</span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-primary-600" />
                        Lab Configuration
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your laboratory's identity, branding, and contact details.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.labName ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {formData.labName ? 'Profile Active' : 'Setup Required'}
                    </span>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                    } animate-in fade-in slide-in-from-top-2 flex items-center gap-2`}>
                    {message.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Branding & Preview */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Logo Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Upload className="w-4 h-4 text-gray-400" /> Branding
                        </h3>

                        <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="logo-upload"
                            className="w-full aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 group-hover:border-primary-400 group-hover:bg-primary-50/10 transition-all cursor-pointer relative overflow-hidden"
                        >
                            {formData.logo ? (
                                <div className="relative w-full h-full p-4 flex items-center justify-center bg-white">
                                    <img
                                        src={`http://127.0.0.1:5000${formData.logo}`}
                                        alt="Logo"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-medium transform translate-y-2 group-hover:translate-y-0 transition-all">Change Logo</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-primary-400" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center px-4">Click to upload brand logo</p>
                                    <p className="text-[10px] text-gray-300">Rec: 400x400px (PNG)</p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Live Preview Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Live Preview
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowPreview(true)}
                                className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Eye className="w-3 h-3" /> Enlarge
                            </button>
                        </div>

                        {/* Mini A4 Preview Render */}
                        <div className="rounded-lg shadow-inner overflow-hidden border border-gray-200">
                            <LetterheadPreview fullSize={false} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Lab Details</h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-400 border border-white shadow-sm" title="Red"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white shadow-sm" title="Yellow"></span>
                                <span className="w-3 h-3 rounded-full bg-green-400 border border-white shadow-sm" title="Green"></span>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Identity Section */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <span className="w-8 h-[1px] bg-primary-200"></span> Identity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Laboratory Name *</label>
                                        <div className="relative group">
                                            <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="labName"
                                                value={formData.labName}
                                                onChange={handleChange}
                                                placeholder="e.g. Apex Diagnostics"
                                                className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.labName ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all`}
                                            />
                                        </div>
                                        {errors.labName && <p className="text-xs text-red-500 font-medium pl-1">{errors.labName}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Business/Legal Name</label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="e.g. Apex Health Services Pvt Ltd"
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Contact Section */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <span className="w-8 h-[1px] bg-primary-200"></span> Contact
                                </h4>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-1">Full Address *</label>
                                    <div className="relative group">
                                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-primary-500 transition-colors" />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="Complete street address, city, state and zip"
                                            className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none`}
                                        ></textarea>
                                    </div>
                                    {errors.address && <p className="text-xs text-red-500 font-medium pl-1">{errors.address}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Mobile Number *</label>
                                        <div className="relative group">
                                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.mobile ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all`}
                                            />
                                        </div>
                                        {errors.mobile && <p className="text-xs text-red-500 font-medium pl-1">{errors.mobile}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-primary-500 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="laboratory@email.com"
                                                className={`w-full pl-10 pr-4 py-3 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all`}
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-gray-100" />

                            {/* Legal Section */}
                            <section className="space-y-4">
                                <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <span className="w-8 h-[1px] bg-primary-200"></span> Legal Info
                                </h4>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-1">GST Number</label>
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="Optional"
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-600 ml-1">Terms & Conditions</label>
                                    <textarea
                                        name="termsAndConditions"
                                        value={formData.termsAndConditions}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="These terms will appear on the bottom of invoices/reports..."
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </section>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-4">
                            <span className="text-xs text-gray-500 italic">Last changes might require page refresh</span>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Full Screen Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="relative bg-gray-100 rounded-2xl shadow-2xl w-auto max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-600" /> Letterhead & Report Preview
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-8 flex justify-center bg-gray-100 dark-scrollbar">
                            <LetterheadPreview fullSize={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
