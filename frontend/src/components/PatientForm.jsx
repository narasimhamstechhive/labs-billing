import React from 'react';
import { UserPlus, User, Phone, Mail, MapPin, Stethoscope } from 'lucide-react';

const PatientForm = ({ formData, handleChange, handleRegister, fieldErrors, loading }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Register New Patient</h3>
                        <p className="text-emerald-100 text-sm">Add patient information</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Name & Title Row */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Patient Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium text-gray-900 ${fieldErrors.name ? 'border-error-500 focus:ring-error-500/20' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>
                        {fieldErrors.name && <p className="mt-1 text-xs text-error-600 font-medium">{fieldErrors.name}</p>}
                    </div>

                    {/* Demographics Row: Age, Months, Gender */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Age</label>
                            <input
                                name="age"
                                type="number"
                                min="0"
                                value={formData.age}
                                onChange={handleChange}
                                className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium text-gray-900 ${fieldErrors.age ? 'border-error-500' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                placeholder="Yrs"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Months</label>
                            <input
                                name="ageMonths"
                                type="number"
                                min="0"
                                max="11"
                                value={formData.ageMonths}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                                placeholder="Mths"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900 appearance-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Contact Row: Mobile & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Mobile *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className={`w-full pl-9 pr-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:bg-white transition-all font-medium text-gray-900 ${fieldErrors.mobile ? 'border-error-500' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Ref. Doctor</label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="referringDoctor"
                                value={formData.referringDoctor}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900"
                                placeholder="Dr. Name"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-gray-900 resize-none"
                                rows="2"
                                placeholder="Street, Area, City"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-200"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                <span>Register Patient</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientForm;