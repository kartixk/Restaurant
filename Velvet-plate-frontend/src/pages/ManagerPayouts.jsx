// src/pages/ManagerPayouts.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Wallet, TrendingDown, Landmark, ArrowDownToLine, Lock } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function ManagerPayouts() {
    const [branch, setBranch] = useState(null);
    const [summary, setSummary] = useState({ earned: 0, fee: 0 });
    const [requesting, setRequesting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const brRes = await api.get("/branches/my-branch");
                setBranch(brRes.data);
                const repRes = await api.get("/reports/branch-sales?type=month");
                const data = Array.isArray(repRes.data) ? (repRes.data[0] || {}) : repRes.data;
                const gross = data.totalAmount || 0;
                setSummary({ earned: gross * 0.85, fee: gross * 0.15 });
            } catch { setSummary({ earned: 0, fee: 0 }); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const requestPayout = async () => {
        if (summary.earned <= 0) return toast.warning("No balance available.");
        setRequesting(true);
        try {
            await api.post("/payouts/request", { amount: summary.earned });
            toast.success("Payout requested! Funds will transfer in 2-3 business days.");
        } catch (err) { toast.error(err.response?.data?.error || "Payout request failed"); }
        finally { setRequesting(false); }
    };

    return (
        <ManagerLayout>
            <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "40px", boxSizing: "border-box" }}>
                {/* Heading */}
                <div className="mb-10">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Payouts</h1>
                    <p className="text-slate-500 text-sm font-medium">Earnings summary and bank settlement options.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-sm text-slate-400">Loading earnings...</div>
                ) : (
                    <>
                        {/* Earnings Cards Row */}
                        <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
                            {/* Available Payout — Hero Dark Card */}
                            <div
                                className="relative overflow-hidden flex flex-col"
                                style={{
                                    borderRadius: "24px",
                                    padding: "32px",
                                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
                                    boxShadow: "0 20px 50px rgba(15,23,42,0.3)",
                                    boxSizing: "border-box",
                                    minHeight: "220px",
                                }}
                            >
                                {/* Decorative blob */}
                                <div style={{
                                    position: "absolute", top: "-40px", right: "-40px",
                                    width: "200px", height: "200px",
                                    background: "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }} />
                                <div style={{
                                    position: "absolute", bottom: "-20px", left: "20px",
                                    width: "120px", height: "120px",
                                    background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }} />

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="flex items-center justify-center rounded-2xl" style={{ width: "44px", height: "44px", background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.2)" }}>
                                        <Wallet size={20} style={{ color: "#fb923c" }} />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available to Settle</div>
                                        <div className="text-slate-500 text-xs font-medium mt-0.5">After 15% platform deduction</div>
                                    </div>
                                </div>

                                <div className="text-5xl font-extrabold tracking-tighter mb-6 relative z-10" style={{ color: "#fb923c" }}>
                                    {fmt(summary.earned)}
                                </div>

                                <button
                                    onClick={requestPayout}
                                    disabled={requesting || summary.earned <= 0}
                                    className="flex items-center justify-center gap-2.5 font-bold text-sm rounded-xl transition-all relative z-10"
                                    style={{
                                        padding: "14px 24px",
                                        width: "fit-content",
                                        background: summary.earned > 0 ? "linear-gradient(135deg,#f97316,#ef4444)" : "rgba(255,255,255,0.1)",
                                        color: "white",
                                        border: "none",
                                        cursor: summary.earned > 0 ? "pointer" : "not-allowed",
                                        opacity: requesting ? 0.7 : 1,
                                        boxShadow: summary.earned > 0 ? "0 4px 14px rgba(249,115,22,0.4)" : "none",
                                    }}
                                >
                                    <ArrowDownToLine size={16} />
                                    {requesting ? "Processing..." : "Request Payout"}
                                </button>
                            </div>

                            {/* Platform Fee Card */}
                            <div
                                style={{
                                    background: "white",
                                    borderRadius: "24px",
                                    padding: "28px",
                                    border: "1px solid #f1f5f9",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                                    position: "relative",
                                    overflow: "hidden",
                                    boxSizing: "border-box",
                                }}
                            >
                                {/* Gradient top accent */}
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)" }} />
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center rounded-2xl" style={{ width: "44px", height: "44px", background: "rgba(139,92,246,0.1)" }}>
                                        <TrendingDown size={20} style={{ color: "#7c3aed" }} />
                                    </div>
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Platform Fee (15%)</div>
                                </div>
                                <div className="text-4xl font-extrabold text-slate-900 tracking-tighter mb-3">{fmt(summary.fee)}</div>
                                <div className="text-xs text-slate-400 font-medium">Deducted from gross revenue</div>
                            </div>
                        </div>

                        {/* Bank Account Panel */}
                        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "20px" }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(16,185,129,0.1)" }}>
                                    <Landmark size={15} style={{ color: "#059669" }} />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 m-0">Settlement Account</h2>
                            </div>
                            <div style={{ padding: "24px" }}>
                                {branch?.bankAccountName ? (
                                    <div className="flex flex-col gap-4">
                                        {[
                                            { label: "Account Holder", value: branch.bankAccountName },
                                            { label: "Account Number", value: `•••• •••• ${branch.bankAccountNumber?.slice(-4)}` },
                                            { label: "IFSC Code", value: branch.bankIfscCode },
                                        ].map(({ label, value }) => (
                                            <div key={label} style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                                <span className="text-slate-500 text-sm font-semibold">{label}</span>
                                                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                    <Lock size={12} className="text-slate-300" /> {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 font-medium">No bank account linked. Complete your store profile to enable payouts.</p>
                                )}
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                                <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(59,130,246,0.1)" }}>
                                    <ArrowDownToLine size={15} style={{ color: "#2563eb" }} />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 m-0">Transaction History</h2>
                            </div>
                            <div style={{ padding: "60px 40px", textAlign: "center", color: "#94a3b8" }}>
                                <div className="flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ width: "52px", height: "52px", background: "#f1f5f9" }}>
                                    <ArrowDownToLine size={22} style={{ color: "#cbd5e1" }} />
                                </div>
                                <p className="font-semibold text-sm">No payout transactions yet.</p>
                                <p className="text-xs mt-1">Request your first payout to see it here.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ManagerLayout>
    );
}
