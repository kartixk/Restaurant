// src/pages/ManagerPayouts.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";

const formatCurrency = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

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
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Payouts</h1>
                        <p className="text-base text-slate-500 font-medium">Earnings summary and bank settlement options.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20 text-sm text-slate-400">Loading earnings...</div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-8">
                        {/* Available */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm box-border">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available to Settle</span>
                            <div className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none">{formatCurrency(summary.earned)}</div>
                            <button
                                onClick={requestPayout}
                                disabled={requesting || summary.earned <= 0}
                                className="px-4 py-2.5 bg-[#FF5A00] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 w-full"
                            >
                                {requesting ? "Processing..." : "Request Payout"}
                            </button>
                        </div>

                        {/* Platform Fee */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm box-border">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Fee (15%)</span>
                            <div className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none">{formatCurrency(summary.fee)}</div>
                            <div className="text-xs text-slate-400 font-medium">Deducted from gross revenue</div>
                        </div>
                    </div>
                )}

                {/* Bank Account Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border mb-8">
                    <div className="p-6 border-b border-slate-50 box-border">
                        <h2 className="text-lg font-bold text-slate-900 m-0">Settlement Account</h2>
                    </div>
                    <div className="p-6">
                        {branch?.bankAccountName ? (
                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-[160px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">Account Holder</span>
                                    <span className="font-semibold text-slate-900 text-sm">{branch.bankAccountName}</span>
                                </div>
                                <div className="grid grid-cols-[160px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">Account Number</span>
                                    <span className="font-semibold text-slate-900 text-sm">•••• {branch.bankAccountNumber?.slice(-4)}</span>
                                </div>
                                <div className="grid grid-cols-[160px,1fr] items-center">
                                    <span className="text-slate-500 text-sm font-medium">IFSC Code</span>
                                    <span className="font-semibold text-slate-900 text-sm">{branch.bankIfscCode}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 font-medium">No bank account linked. Complete your store profile to enable payouts.</p>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border">
                    <div className="p-6 border-b border-slate-50 box-border">
                        <h2 className="text-lg font-bold text-slate-900 m-0">Transaction History</h2>
                    </div>
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-base text-center font-medium">
                        No payout transactions yet.
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}
