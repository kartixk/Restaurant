import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBranches } from "../hooks/useBranches";
import api from "../api/axios";
import { toast } from "react-toastify";
import { ExternalLink, X, Clock, Store, FileText, CheckCircle, XCircle, ChevronLeft, Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function InfoRow({ label, value, full = false }) {
    return (
        <div className={`flex flex-col gap-0.5 ${full ? 'col-span-full' : ''}`}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
            <span className="text-sm font-bold text-slate-900 truncate" title={value}>{value || "N/A"}</span>
        </div>
    );
}

function DocLink({ label, url, onPreview }) {
    if (!url) return null;
    const fullUrl = url.startsWith("http") ? url : `http://localhost:4000${url}`;
    return (
        <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <FileText size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <button
                onClick={() => onPreview({ label, url: fullUrl })}
                className="flex items-center gap-1.5 text-xs font-black text-orange-600 hover:text-orange-700 transition-colors bg-white px-3 py-1.5 rounded-lg border border-orange-100 shadow-sm"
            >
                PREVIEW <ExternalLink size={14} />
            </button>
        </div>
    );
}

export default function AdminPendingRequests() {
    const navigate = useNavigate();
    const { data: dbBranches = [], refetch: refetchBranches } = useBranches();
    const [selectedDoc, setSelectedDoc] = useState(null);

    const pendingStores = useMemo(() =>
        dbBranches.filter(b => b.storeStatus === "under_review"),
        [dbBranches]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/branches/${id}/verify`, { status: "verified" });
            toast.success("Store approved successfully!", {
                icon: <CheckCircle className="text-emerald-500" />
            });
            refetchBranches();
        } catch { toast.error("Failed to approve store."); }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/branches/${id}/verify`, { status: "rejected" });
            toast.success("Store application rejected.");
            refetchBranches();
        } catch { toast.error("Failed to reject store."); }
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—";

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/admin")}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">Pending Applications</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Review and onboard new restaurant partners</p>
                    </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-sm">
                    <div className="text-2xl font-black text-orange-600 line-height-none">{pendingStores.length}</div>
                    <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-tight">Requests<br />Waiting</div>
                </div>
            </div>

            {/* Body Content */}
            <div className="max-w-[1400px] mx-auto p-8">
                {pendingStores.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-[32px] p-20 text-center shadow-sm flex flex-col items-center gap-6"
                    >
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-100">
                            <CheckCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">All Caught Up!</h3>
                            <p className="text-slate-500 font-medium mt-2">There are no pending manager applications at the moment.</p>
                        </div>
                        <button
                            onClick={() => navigate("/admin")}
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            Back to Dashboard
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {pendingStores.map((store, index) => (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white border border-slate-200 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all overflow-hidden flex flex-col"
                            >
                                {/* Store Card Header */}
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-600/20 border-2 border-white overflow-hidden bg-cover bg-center"
                                                style={{
                                                    backgroundImage: store.managerPhotoUrl ? `url(${store.managerPhotoUrl.startsWith('http') ? store.managerPhotoUrl : `http://localhost:4000${store.managerPhotoUrl}`})` : "none"
                                                }}
                                            >
                                                {!store.managerPhotoUrl && (store.manager?.name || "M")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight">{store.manager?.name || "Unknown Manager"}</h3>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">#{store.id?.slice(-6).toUpperCase()}</span>
                                                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">NEW REQ</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Mail size={14} />
                                                <span className="text-xs font-bold truncate max-w-[150px]">{store.manager?.email || "No email"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Phone size={14} />
                                                <span className="text-xs font-bold">{store.phone || store.manager?.phone || "No phone"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Store Card Body */}
                                <div className="p-6 flex flex-col gap-6 flex-1">
                                    {/* Store Info Section */}
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3 text-orange-600">
                                            <Store size={14} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store Identity</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                            <InfoRow label="Restaurant" value={store.name} />
                                            <InfoRow label="Branch" value={store.branchName} />
                                            <InfoRow label="Location" value={`${store.city}, ${store.state}`} />
                                            <InfoRow label="Pincode" value={store.pincode} />
                                            <InfoRow label="Address" value={store.address} full />
                                        </div>
                                    </div>

                                    {/* Banking / Financials */}
                                    <div className="bg-slate-900 rounded-3xl p-5 shadow-inner">
                                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                                            <CheckCircle size={14} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Payout Account</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Holder</span>
                                                <p className="text-sm font-bold text-white truncate">{store.bankAccountName || "N/A"}</p>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">IFSC Code</span>
                                                <p className="text-sm font-bold text-orange-400 truncate tracking-wider">{store.bankIfscCode || "N/A"}</p>
                                            </div>
                                            <div className="col-span-full">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Account Number</span>
                                                <p className="text-lg font-black text-white tracking-widest font-mono">{store.bankAccountNumber || "•••• •••• ••••"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documentation Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-slate-400">
                                            <FileText size={14} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Verifiable Docs</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <DocLink label="FSSAI License" url={store.fssaiPdfUrl} onPreview={setSelectedDoc} />
                                            <DocLink label="GST Certificate" url={store.gstPdfUrl} onPreview={setSelectedDoc} />
                                            <DocLink label="Bank Passbook" url={store.bankPassbookPdfUrl} onPreview={setSelectedDoc} />
                                        </div>
                                    </div>
                                </div>

                                {/* Store Card Footer */}
                                <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock size={14} />
                                        <span className="text-[11px] font-bold italic">Filed {formatDate(store.createdAt)}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReject(store.id)}
                                            className="px-5 py-2.5 rounded-xl border border-red-100 bg-white text-red-500 text-xs font-black hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <XCircle size={14} /> REJECT
                                        </button>
                                        <button
                                            onClick={() => handleApprove(store.id)}
                                            className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-black shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} /> APPROVE
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setSelectedDoc(null)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none">{selectedDoc.label}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">Verification Document Preview</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDoc(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                                >
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Modal Body (Preview Area) */}
                            <div className="p-8 overflow-y-auto bg-slate-50 flex-1 flex flex-col items-center justify-center min-h-[400px]">
                                {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={`${selectedDoc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                        title={selectedDoc.label}
                                        className="w-full h-[60vh] border-none rounded-[24px] bg-white shadow-2xl border-4 border-white"
                                    />
                                ) : (
                                    <div className="relative group">
                                        <img
                                            src={selectedDoc.url}
                                            alt={selectedDoc.label}
                                            className="max-w-full max-h-[60vh] rounded-[24px] object-contain shadow-2xl border-4 border-white"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/800x600/ffffff/64748b?text=Preview+Service+Unavailable';
                                            }}
                                        />
                                        <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-slate-950/10 pointer-events-none"></div>
                                    </div>
                                )}

                                <div className="mt-8 flex gap-4">
                                    <a
                                        href={selectedDoc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
                                    >
                                        <ExternalLink size={16} /> Open Full View
                                    </a>
                                    <button
                                        onClick={() => setSelectedDoc(null)}
                                        className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
