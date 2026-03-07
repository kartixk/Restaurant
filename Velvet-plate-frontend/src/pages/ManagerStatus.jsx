// src/pages/ManagerStatus.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { Clock, ShieldCheck, LogOut, Mail, HelpCircle, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ManagerStatus() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                if (res.data) {
                    if (res.data.storeStatus?.toLowerCase() === "verified") navigate("/manager/dashboard");
                } else {
                    navigate("/manager/onboarding");
                }
            } catch (err) {
                if (err.response?.status === 404) navigate("/manager/onboarding");
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Activity className="text-orange-500 animate-pulse" size={48} />
        </div>
    );

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8 font-sans selection:bg-orange-100">
            {/* Background accents */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-100/50 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white max-w-2xl w-full p-16 lg:p-24 flex flex-col items-center text-center gap-12 rounded-[60px] border border-slate-200 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden"
            >
                {/* Decorative Element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500" />

                <div className="relative">
                    <div className="w-28 h-28 rounded-[40px] bg-slate-900 text-orange-500 flex items-center justify-center shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Clock size={48} strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border-4 border-slate-50 flex items-center justify-center text-emerald-500 shadow-lg">
                        <ShieldCheck size={20} />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-5xl font-black text-slate-950 tracking-tighter leading-none lowercase">
                        status: <span className="text-orange-600 italic">under_audit</span>
                    </h1>
                    <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md mx-auto italic">
                        Your entity credentials and financial metadata are currently undergoing high-fidelity verification by our compliance team.
                    </p>
                </div>

                <div className="w-full space-y-12">
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-2 h-2 rounded-full bg-orange-600"
                                />
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Analysis in progress</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={handleLogout}
                            className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white hover:border-slate-900 active:scale-95 transition-all shadow-xl shadow-slate-200/50 flex items-center justify-center gap-3"
                        >
                            <LogOut size={16} /> Terminate Session
                        </button>
                        <a
                            href="mailto:partners@velvetplate.com"
                            className="w-full sm:w-auto px-10 py-5 bg-orange-50 text-orange-600 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <Mail size={16} /> Urgent Uplink
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            <HelpCircle size={12} /> protocol support
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                            REFERENCE ID: <span className="text-slate-900 font-black">{(user?.id || 'AUTH-000').slice(-8).toUpperCase()}</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
