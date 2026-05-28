// src/pages/ManagerStore.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Wifi, WifiOff, MapPin, Phone, Clock, Shield, Landmark } from "lucide-react";

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
            toast.success(branch.isVisible ? "Store hidden from customers" : "Store is now live!");
        } catch { toast.error("Failed to update visibility"); }
        finally { setToggling(false); }
    };

    const isLive = branch?.isVisible && branch?.storeStatus?.toLowerCase() === "verified";
    const isVerified = branch?.storeStatus?.toLowerCase() === "verified";

    const InfoRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #f8fafc" }}>
            {Icon && (
                <div className="flex-shrink-0 mt-0.5">
                    <Icon size={14} className="text-slate-400" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-slate-900 font-semibold text-sm">{value || "—"}</div>
            </div>
        </div>
    );

    return (
        <ManagerLayout>
            <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "40px", boxSizing: "border-box" }}>
                {/* Page heading */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">My Store</h1>
                        <p className="text-slate-500 text-sm font-medium">Branch configuration and compliance overview.</p>
                    </div>
                    {isVerified && (
                        <button
                            onClick={handleToggleVisibility}
                            disabled={toggling}
                            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
                            style={{
                                ...(branch?.isVisible
                                    ? { background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", boxShadow: "none" }
                                    : { background: "linear-gradient(135deg,#f97316,#ef4444)", border: "none", color: "white", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }
                                ),
                            }}
                        >
                            {branch?.isVisible ? <><WifiOff size={16} /> Go Offline</> : <><Wifi size={16} /> Go Live →</>}
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-sm text-slate-400">Loading store data...</div>
                ) : !branch ? (
                    <div className="rounded-2xl p-20 flex flex-col items-center text-center" style={{ background: "white", border: "1px dashed #e2e8f0" }}>
                        <p className="text-slate-400 font-medium">No branch data found. Complete your onboarding first.</p>
                    </div>
                ) : (
                    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 2fr" }}>

                        {/* Status Card */}
                        <div className="flex flex-col gap-4">
                            <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc" }}>
                                    <h2 className="text-base font-bold text-slate-900 m-0">Store Status</h2>
                                </div>
                                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {/* Live indicator */}
                                    <div
                                        className="flex items-center gap-4 rounded-2xl"
                                        style={{
                                            padding: "20px",
                                            background: isLive ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f8fafc",
                                            border: isLive ? "1px solid #bbf7d0" : "1px solid #f1f5f9",
                                        }}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="rounded-full"
                                                style={{
                                                    width: "12px", height: "12px",
                                                    backgroundColor: isLive ? "#22c55e" : "#94a3b8",
                                                    boxShadow: isLive ? "0 0 0 4px rgba(34,197,94,0.25)" : "none",
                                                }}
                                            />
                                            {isLive && (
                                                <div
                                                    className="absolute inset-0 rounded-full animate-ping"
                                                    style={{ backgroundColor: "rgba(34,197,94,0.3)" }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm" style={{ color: isLive ? "#15803d" : "#475569" }}>
                                                {isLive ? "Accepting Orders" : "Offline"}
                                            </div>
                                            <div className="text-xs font-medium mt-0.5" style={{ color: isLive ? "#16a34a" : "#94a3b8" }}>
                                                {branch?.storeStatus}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="rounded-xl grid grid-cols-2 gap-3" style={{ background: "#f8fafc", padding: "16px", border: "1px solid #f1f5f9" }}>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"><Clock size={11} /> Opens</div>
                                            <div className="font-bold text-slate-900">{branch?.openTime || "—"}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"><Clock size={11} /> Closes</div>
                                            <div className="font-bold text-slate-900">{branch?.closeTime || "—"}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right column — details + compliance + bank */}
                        <div className="flex flex-col gap-5">
                            {/* Branch Info */}
                            <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                                <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(249,115,22,0.1)" }}>
                                        <MapPin size={15} style={{ color: "#f97316" }} />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900 m-0">Branch Details</h2>
                                </div>
                                <div style={{ padding: "8px 24px 16px" }}>
                                    <InfoRow label="Restaurant Name" value={branch?.name} />
                                    <InfoRow label="Branch Name" value={branch?.branchName} />
                                    <InfoRow label="Phone" value={branch?.phone} icon={Phone} />
                                    <InfoRow label="Address" value={branch?.address} icon={MapPin} />
                                    <InfoRow label="City" value={branch?.city} />
                                    <InfoRow label="State / Pincode" value={`${branch?.state || ""} ${branch?.pincode || ""}`} />
                                </div>
                            </div>

                            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                                {/* Compliance */}
                                <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(139,92,246,0.1)" }}>
                                            <Shield size={15} style={{ color: "#7c3aed" }} />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-900 m-0">Legal & Compliance</h2>
                                    </div>
                                    <div style={{ padding: "8px 24px 16px" }}>
                                        <InfoRow label="FSSAI License" value={branch?.fssaiLicense} />
                                        <InfoRow label="GST Number" value={branch?.gstNumber} />
                                        <InfoRow label="PAN Number" value={branch?.panNumber} />
                                    </div>
                                </div>

                                {/* Bank */}
                                <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(16,185,129,0.1)" }}>
                                            <Landmark size={15} style={{ color: "#059669" }} />
                                        </div>
                                        <h2 className="text-base font-bold text-slate-900 m-0">Bank Account</h2>
                                    </div>
                                    <div style={{ padding: "8px 24px 16px" }}>
                                        <InfoRow label="Account Holder" value={branch?.bankAccountName} />
                                        <InfoRow label="Account Number" value={branch?.bankAccountNumber ? `•••• ${branch.bankAccountNumber.slice(-4)}` : "—"} />
                                        <InfoRow label="IFSC Code" value={branch?.bankIfscCode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ManagerLayout>
    );
}
