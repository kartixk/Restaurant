// src/components/features/admin/BranchSettingsModal.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateBranch } from "../../../hooks/useBranches";
import { toast } from "react-toastify";
import { Store, MapPin, Phone, ShieldCheck, Eye, EyeOff, X, Save, Trash2, Map, Navigation } from "lucide-react";

export default function BranchSettingsModal({ isOpen, onClose, branch }) {
    const updateBranchMutation = useUpdateBranch();
    const [formData, setFormData] = useState({
        name: "",
        branchName: "",
        location: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        gstNumber: "",
        fssaiLicense: "",
        isVisible: false,
        storeStatus: "pending"
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || "",
                branchName: branch.branchName || "",
                location: branch.location || "",
                address: branch.address || "",
                city: branch.city || "",
                state: branch.state || "",
                pincode: branch.pincode || "",
                phone: branch.phone || "",
                gstNumber: branch.gstNumber || "",
                fssaiLicense: branch.fssaiLicense || "",
                isVisible: branch.isVisible || false,
                storeStatus: branch.storeStatus || "pending"
            });
        }
    }, [branch]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateBranchMutation.mutate(
            { id: branch.id, data: formData },
            {
                onSuccess: () => {
                    toast.success("Branch master settings synchronized.");
                    onClose();
                },
                onError: (err) => {
                    toast.error(err?.response?.data?.message || "Configuration update failed");
                }
            }
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Branch Master Config</h2>
                            <p className="text-sm text-slate-500 font-medium mt-1">Operational and legal overrides for this location.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex flex-col gap-10">
                        {/* Section: Entity Identity */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                                    <Store size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Entity Identity</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Trading Name</label>
                                    <input
                                        type="text" name="name" value={formData.name} onChange={handleChange}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all shadow-inner"
                                        placeholder="e.g. Velvet Plate Downtown" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Legal Entity Name</label>
                                    <input
                                        type="text" name="branchName" value={formData.branchName} onChange={handleChange}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all shadow-inner"
                                        placeholder="Registered corporate name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Geographic & Contact */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Geographic Assets</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Street Address</label>
                                    <textarea
                                        name="address" value={formData.address} onChange={handleChange}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all shadow-inner min-h-[100px] resize-none"
                                        placeholder="Complete street details"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">City/State</label>
                                    <div className="flex gap-2">
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-1/2 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="ST" className="w-1/2 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">PIN / Contact</label>
                                    <div className="flex gap-2">
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="PIN" className="w-1/2 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-1/2 px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Regulatory & Presence */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Regulatory & Presence</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Compliance IDs</label>
                                    <div className="flex flex-col gap-2">
                                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="GSTIN" className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-black text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                        <input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} placeholder="FSSAI Num" className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-black text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vetting Status</label>
                                        <select
                                            name="storeStatus" value={formData.storeStatus} onChange={handleChange}
                                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="pending">PENDING ONBOARDING</option>
                                            <option value="under_review">UNDER SEC REVIEW</option>
                                            <option value="verified">VERIFIED (ACTIVE)</option>
                                        </select>
                                    </div>
                                    <label className="flex items-center justify-between p-4 px-5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group shadow-inner">
                                        <div className="flex items-center gap-3">
                                            {formData.isVisible ? <Eye size={18} className="text-orange-600" /> : <EyeOff size={18} className="text-slate-400" />}
                                            <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Public Visibility</span>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 shadow-sm border border-transparent"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-4 bg-white sticky bottom-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                            >
                                Discard Overrides
                            </button>
                            <button
                                type="submit"
                                disabled={updateBranchMutation.isLoading}
                                className="px-10 py-4 bg-orange-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-600/20 hover:bg-orange-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 min-w-[240px]"
                            >
                                {updateBranchMutation.isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <><Save size={16} strokeWidth={3} /> Commit Parameters</>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
