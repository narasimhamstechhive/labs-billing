import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, ArrowRight, Microscope, Shield, Zap, Check, Eye, EyeOff, Star, Award, TrendingUp } from 'lucide-react';
import { authAPI } from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    // Mouse parallax effect for premium feel
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const { data } = await authAPI.login(email, password);
            localStorage.setItem('userInfo', JSON.stringify(data));
            window.location.href = '/dashboard';
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Details not available';
            setError(errorMessage || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen overflow-hidden bg-[#020617] font-sans selection:bg-cyan-500/30">
            {/* --- ADVANCED BACKGROUND MESH --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-delayed"></div>
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>

                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
            </div>

            {/* --- LEFT SIDE: HERO CONTENT --- */}
            <div className={`hidden lg:flex lg:w-[55%] relative z-10 items-center justify-center p-12 transition-transform duration-700 ease-out`}
                style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}>

                <div className="max-w-lg">
                    {/* Premium Label */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6 animate-fade-in">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Next-Gen Lab Management
                    </div>

                    <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
                        Precision Meets <br />
                        <span className="relative inline-block mt-2">
                            <span className="relative z-10 bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                                Digital Mastery.
                            </span>
                            <div className="absolute -bottom-1.5 left-0 w-full h-[4px] bg-cyan-500/40 blur-sm rounded-full"></div>
                        </span>
                    </h1>

                    <p className="text-base text-slate-400 mb-8 leading-relaxed font-light">
                        The ultimate Lab Information System designed for elite medical institutions.
                        Experience speed, accuracy, and enterprise-grade intelligence in a single workspace.
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-5 pb-10">
                        {[
                            { icon: Microscope, title: 'Smart LIS', desc: 'AI Testing Architecture', accent: 'cyan' },
                            { icon: Zap, title: 'Instant Sync', desc: 'Cloud Hub Connection', accent: 'blue' },
                            { icon: Award, title: 'Certified', desc: 'Global Health Standards', accent: 'indigo' },
                            { icon: TrendingUp, title: 'Analytics', desc: 'Real-time Vital Data', accent: 'purple' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-3 group cursor-default">
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-white/20 group-hover:bg-slate-800 transition-all duration-300">
                                    <f.icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-0.5 tracking-wide">{f.title}</h4>
                                    <p className="text-[11px] text-slate-500 group-hover:text-slate-400">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Proof */}
                    <div className="flex items-center gap-10 pt-6 border-t border-slate-800/60">
                        <div>
                            <div className="text-2xl font-black text-white">99.9%</div>
                            <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 py-1">Uptime SLA</div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800"></div>
                        <div>
                            <div className="text-2xl font-black text-white">1.2M+</div>
                            <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 py-1">Reports Monthly</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full lg:w-[45%] relative z-20 flex items-center justify-center p-6 lg:p-10">
                <div className={`w-full max-w-[400px] transition-transform duration-500 ease-out`}
                    style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}>

                    {/* Global Logo Header */}
                    <div className="flex flex-col items-center mb-8 lg:items-start">
                        <div className="relative w-14 h-14 mb-5">
                            <div className="absolute inset-0 bg-cyan-500 rounded-2xl rotate-6 transition-transform group-hover:rotate-0 duration-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>
                            <div className="absolute inset-0 bg-[#0f172a] rounded-2xl border border-white/10 flex items-center justify-center">
                                <Activity className="w-7 h-7 text-cyan-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-white tracking-tight">MediLab <span className="text-cyan-500 italic">Cloud</span></h2>
                        <p className="text-slate-500 text-xs font-medium">Enterprise Intelligence Suite</p>
                    </div>

                    {/* LOGIN CARD */}
                    <div className="relative group">
                        {/* Interactive Border Glow */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-[2rem] opacity-30 group-hover:opacity-100 blur-[2px] transition-opacity duration-500"></div>

                        {/* Background Overlay */}
                        <div className="relative bg-[#0b1120] p-8 lg:p-10 rounded-[1.9rem] border border-white/5 shadow-2xl backdrop-blur-xl">

                            <div className="mb-8 text-center lg:text-left">
                                <h3 className="text-2xl font-extrabold text-white mb-2">Sign In</h3>
                                <div className="h-0.5 w-10 bg-cyan-500 rounded-full lg:mx-0 mx-auto"></div>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                    <p className="text-xs text-red-200 font-bold uppercase tracking-tight">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-2 ml-1">Work Address</label>
                                    <div className="relative group/field">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-cyan-400 transition-colors">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-[#020617] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all text-white placeholder:text-slate-600 font-medium text-sm"
                                            placeholder="doctor@medical.io"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="pb-2">
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500">Access Key</label>
                                        <a href="#" className="text-[9px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Recovery?</a>
                                    </div>
                                    <div className="relative group/field">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/field:text-cyan-400 transition-colors">
                                            <Lock className="w-3.5 h-3.5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-11 py-3 bg-[#020617] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all text-white placeholder:text-slate-600 font-medium text-sm"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group/btn relative w-full overflow-hidden rounded-xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 group-hover/btn:scale-105"></div>
                                    <div className="relative flex items-center justify-center gap-2 py-4 px-8 text-white font-black uppercase tracking-[0.15em] text-[11px]">
                                        {loading ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Initialize Access
                                                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            {/* Trust Footer */}
                            <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-5 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Shield className="w-2.5 h-2.5 text-cyan-500" /> Encrypted</span>
                                <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest"><Check className="w-2.5 h-2.5 text-cyan-500" /> SOC2 v3</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-[10px] font-bold text-slate-600 mt-8 uppercase tracking-[0.3em]">
                        &copy; 2026 MediLab Intelligent Systems
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse-delayed {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.1); }
                }
                .animate-pulse-delayed {
                    animation: pulse-delayed 12s infinite ease-in-out;
                }
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white' stroke-opacity='0.1'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
                }
                @font-face {
                    font-family: 'Geist';
                    src: url('https://cdn.jsdelivr.net/font/geist/latest/Geist-Variable.woff2') format('woff2');
                }
                body {
                    font-family: 'Geist', sans-serif;
                }
            `}</style>
        </div>
    );
};

export default Login;
