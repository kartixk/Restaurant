// src/pages/ManagerStore.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ManagerStore() {
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        api.get("/branches/my-branch").then(r => setBranch(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleToggleVisibility = async () => {
        if (!branch) return;
        setToggling(true);
        try {
            await api.patch(`/branches/${branch.id}/visibility`, { isVisible: !branch.isVisible });
            setBranch(p => ({ ...p, isVisible: !p.isVisible }));
            toast.success(branch.isVisible ? "Store hidden from customers" : "Store is now visible");
        } catch { toast.error("Failed to update visibility"); }
        finally { setToggling(false); }
    };

    const Field = ({ label, value }) => (
        <div className="grid grid-cols-[160px,1fr] items-start py-3 border-b border-slate-50 last:border-0">
            <span className="text-slate-500 text-sm font-medium">{label}</span>
            <span className="font-semibold text-slate-900 text-sm">{value || "—"}</span>
        </div>
    );

    return (
        <ManagerLayout>
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">My Store</h1>
                        <p className="text-base text-slate-500 font-medium">Branch configuration and compliance overview.</p>
                    </div>
                    {branch?.storeStatus?.toLowerCase() === "verified" && (
                        <button
                            onClick={handleToggleVisibility}
                            disabled={toggling}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border cursor-pointer transition-all disabled:opacity-50 shadow-sm ${branch?.isVisible ? "bg-white border-slate-200 text-slate-900 hover:bg-slate-50" : "bg-[#FF5A00] border-[#FF5A00] text-white hover:opacity-90"}`}
                        >
                            {branch?.isVisible ? "Go Offline" : "Go Live →"}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-sm text-slate-400">Loading store data...</div>
                ) : !branch ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
                        <p className="text-slate-400 font-medium">No branch data found. Complete your onboarding first.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 m-0">Store Status</h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${branch?.isVisible && branch?.storeStatus?.toLowerCase() === "verified" ? "bg-emerald-500" : "bg-slate-400"}`} />
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{branch?.isVisible && branch?.storeStatus?.toLowerCase() === 'verified' ? 'Accepting Orders' : 'Offline'}</div>
                                        <div className="text-xs text-slate-500 font-medium capitalize mt-0.5">Status: {branch?.storeStatus}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Opens</div>
                                        <div className="font-bold text-slate-900 text-sm">{branch?.openTime}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Closes</div>
                                        <div className="font-bold text-slate-900 text-sm">{branch?.closeTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branch Info */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Branch Details</h2>
                            <Field label="Restaurant Name" value={branch?.name} />
                            <Field label="Branch Name" value={branch?.branchName} />
                            <Field label="Phone" value={branch?.phone} />
                            <Field label="Address" value={branch?.address} />
                            <Field label="City" value={branch?.city} />
                            <Field label="State / Pincode" value={`${branch?.state || ""} ${branch?.pincode || ""}`} />
                        </div>

                        {/* Compliance */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Legal & Compliance</h2>
                            <Field label="FSSAI License" value={branch?.fssaiLicense} />
                            <Field label="GST Number" value={branch?.gstNumber} />
                            <Field label="PAN Number" value={branch?.panNumber} />
                        </div>

                        {/* Bank */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Bank Account</h2>
                            <Field label="Account Holder" value={branch?.bankAccountName} />
                            <Field label="Account Number" value={branch?.bankAccountNumber ? `•••• ${branch.bankAccountNumber.slice(-4)}` : "—"} />
                            <Field label="IFSC Code" value={branch?.bankIfscCode} />
                        </div>
                    </div>
                )}
            </div>
        </ManagerLayout>
    );
}
