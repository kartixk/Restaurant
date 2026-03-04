// src/components/features/admin/ManagerApprovalList.jsx
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCheck, FileText, Mail, Phone, Calendar, Store, CheckCircle, ExternalLink, ShieldAlert } from "lucide-react";

export default function ManagerApprovalList() {
    const [pendingManagers, setPendingManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchPendingManagers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/managers/pending");
            setPendingManagers(res.data.managers || []);
        } catch (err) {
            toast.error("Failed to load pending managers");
        } finally {
            setLoading(false);
        }
    };

    const getFullUrl = (url) => {
        if (!url) return "#";
        return url.startsWith('http') ? url : `http://localhost:4000${url}`;
    };

    useEffect(() => {
        fetchPendingManagers();
    }, []);

    const handleApprove = async (id) => {
        setApproving(id);
        try {
            await api.put(`/admin/managers/${id}/approve`);
            toast.success("Manager authorized for system access!");
            fetchPendingManagers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to approve manager");
        } finally {
            setApproving(null);
        }
    };

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Security Permissions</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2 italic">Authorize new branch leadership accounts</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm">
                    <ShieldAlert size={18} className="text-orange-600" />
                    <span className="text-xs font-black text-orange-600 tracking-widest uppercase">{pendingManagers.length} Awaiting</span>
                </div>
            </div>

            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400">Syncing authorization queue...</p>
                    </div>
                ) : pendingManagers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <CheckCircle size={48} className="text-slate-200" />
                        <p className="text-sm font-bold text-slate-400">Security queue is clear.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {pendingManagers.map((manager, index) => (
                            <motion.div
                                key={manager.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-50/50 border border-slate-200/60 rounded-[28px] p-6 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all group"
                            >
                                <div className="flex gap-6 items-start">
                                    {/* Avatar */}
                                    <div
                                        className="w-20 h-20 rounded-2xl bg-slate-200 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-cover bg-center ring-1 ring-slate-100"
                                        style={{
                                            backgroundImage: manager.managedBranch?.managerPhotoUrl
                                                ? `url(${getFullUrl(manager.managedBranch.managerPhotoUrl)})`
                                                : "none"
                                        }}
                                    >
                                        {!manager.managedBranch?.managerPhotoUrl && (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-2xl">
                                                {manager.name[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{manager.name}</h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Store size={14} className="text-slate-300" />
                                                    <span className="text-xs font-bold text-slate-500 truncate lowercase">
                                                        {manager.managedBranch?.name || 'New Entity'} <span className="text-slate-300 mx-1">•</span> {manager.managedBranch?.branchName || 'TBD'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    <Calendar size={12} /> {new Date(manager.createdAt).toLocaleDateString('en-GB')}
                                                </div>
                                                <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-400">ID: {manager.id?.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>

                                        {/* Contact Pills */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                                                <Mail size={12} className="text-slate-400" /> {manager.email}
                                            </div>
                                            {manager.phone && (
                                                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-600 shadow-sm">
                                                    <Phone size={12} className="text-emerald-400" /> {manager.phone}
                                                </div>
                                            )}
                                        </div>

                                        {/* Document Links */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                            <button
                                                onClick={() => manager.managedBranch?.fssaiPdfUrl && setSelectedDoc({ label: "FSSAI Document", url: getFullUrl(manager.managedBranch.fssaiPdfUrl) })}
                                                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-black transition-all ${manager.managedBranch?.fssaiPdfUrl
                                                        ? "bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600"
                                                        : "bg-slate-100 border-transparent text-slate-300 cursor-not-allowed opacity-50"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2 truncate"><FileText size={14} /> FSSAI</span>
                                                {manager.managedBranch?.fssaiPdfUrl && <ExternalLink size={12} />}
                                            </button>
                                            <button
                                                onClick={() => manager.managedBranch?.gstPdfUrl && setSelectedDoc({ label: "GST Certificate", url: getFullUrl(manager.managedBranch.gstPdfUrl) })}
                                                className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-black transition-all ${manager.managedBranch?.gstPdfUrl
                                                        ? "bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600"
                                                        : "bg-slate-100 border-transparent text-slate-300 cursor-not-allowed opacity-50"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2 truncate"><FileText size={14} /> GST CERT</span>
                                                {manager.managedBranch?.gstPdfUrl && <ExternalLink size={12} />}
                                            </button>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            disabled={approving === manager.id}
                                            onClick={() => handleApprove(manager.id)}
                                            className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 shadow-lg ${approving === manager.id
                                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20 active:scale-[0.98]"
                                                }`}
                                        >
                                            {approving === manager.id ? (
                                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <><UserCheck size={16} strokeWidth={3} /> Authorize System Access</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Document Preview Modal Component */}
            <AnimatePresence>
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setSelectedDoc(null)} />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 m-0">{selectedDoc.label}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto flex justify-center items-center min-h-[400px] bg-slate-50">
                                {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={selectedDoc.url} title={selectedDoc.label} className="w-full h-[60vh] border-none rounded-3xl bg-white shadow-2xl border-4 border-white" />
                                ) : (
                                    <img src={selectedDoc.url} alt={selectedDoc.label} className="max-w-full max-h-[60vh] rounded-3xl object-contain shadow-2xl border-4 border-white" />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
