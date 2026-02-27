// src/pages/ManagerPayouts.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Wallet, ArrowUpRight, Clock, CheckCircle } from "lucide-react";

export default function ManagerPayouts() {
    const [branch, setBranch] = useState(null);
    const [summary, setSummary] = useState({ totalAmount: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchRes, statsRes] = await Promise.all([
                    api.get("/branches/my-branch"),
                    api.get("/reports/branch-sales?type=month")
                ]);
                setBranch(branchRes.data);
                const stats = Array.isArray(statsRes.data) ? (statsRes.data[0] || {}) : statsRes.data;
                setSummary({ totalAmount: stats.totalAmount || 0, count: stats.count || 0 });
            } catch (err) {
                toast.error("Failed to load payout data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

    // if (!branch) return null; // Removed to prevent blank screen

    return (
        <ManagerLayout title="Payouts" subtitle="Manage your earnings and settlement bank details.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', borderTop: '4px solid #10b981' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Available for Payout</p>
                    <h1 style={{ margin: '1rem 0', fontSize: '2.5rem', fontWeight: 800 }}>{formatCurrency(summary.totalAmount * 0.85)}</h1>
                    <button style={{ padding: '0.75rem 1.5rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                        Request Payout
                    </button>
                    <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>* Platform commission (15%) already deducted.</p>
                </div>

                <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={20} /> Bank Account</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Account Holder</p>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{branch?.bankAccountName || 'N/A'}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Account Number</p>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>•••• •••• {branch?.bankAccountNumber?.slice(-4) || 'XXXX'}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>IFSC Code</p>
                            <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{branch?.bankIfscCode || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0 }}>Recent Payout History</h3>
                </div>
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Clock size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                    <p>You haven't requested any payouts yet. <br /> Your first settlement will appear here after approval.</p>
                </div>
            </div>
        </ManagerLayout>
    );
}
