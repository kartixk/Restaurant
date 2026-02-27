// src/pages/ManagerStore.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { CheckCircle, StopCircle, Building, MapPin, Phone, FileText, CreditCard } from "lucide-react";

export default function ManagerStore() {
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBranch = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                setBranch(res.data);
            } catch (err) {
                // Silently handle 404 for new managers
                if (err.response?.status !== 404) {
                    toast.error("Failed to load store settings");
                }
                setBranch(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, []);

    const isVerified = branch?.storeStatus?.toLowerCase() === "verified";
    const handleToggleVisibility = async () => {
        if (!branch?.id) return;
        try {
            const res = await api.put(`/branches/${branch.id}/visibility`, { isVisible: !branch.isVisible });
            setBranch({ ...branch, isVisible: res.data.isVisible });
            toast.success(`Store is now ${res.data.isVisible ? 'Visible' : 'Hidden'}`);
        } catch (err) {
            toast.error("Failed to toggle visibility");
        }
    };

    // if (!branch) return null; // Removed to prevent blank screen

    const S = {
        card: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)", overflow: "hidden", marginBottom: '1.5rem' },
        cardHeader: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
        cardTitle: { fontSize: "1.1rem", fontWeight: 600, color: "#0f172a", margin: 0 },
        cardBody: { padding: "1.5rem" },
        label: { fontSize: "0.875rem", fontWeight: 500, color: "#64748b", margin: '0 0 0.25rem 0' },
        value: { fontSize: "0.95rem", fontWeight: 600, color: "#0f172a", margin: 0 },
        grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
        btnToggle: (active) => ({
            padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid",
            backgroundColor: active ? "#ecfdf5" : "#fef2f2", color: active ? "#059669" : "#dc2626", borderColor: active ? "#10b981" : "#fca5a5"
        })
    };

    return (
        <ManagerLayout title="My Store" subtitle="Configure your restaurant's profile and visibility.">
            <div style={S.card}>
                <div style={S.cardHeader}>
                    <h3 style={S.cardTitle}>Visibility Status</h3>
                    <span className={`manager-badge ${branch?.storeStatus === 'verified' ? 'manager-badge-success' : 'manager-badge-warning'}`}>
                        {branch?.storeStatus?.toUpperCase() || 'UNKNOWN'}
                    </span>
                </div>
                <div style={S.cardBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={S.label}>Consumer Facing Visibility</p>
                            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Hide your store from the menu during emergencies or rush hours.</p>
                        </div>
                        <button onClick={handleToggleVisibility} style={S.btnToggle(branch?.isVisible)}>
                            {branch?.isVisible ? <><CheckCircle size={18} /> Store Active</> : <><StopCircle size={18} /> Store Hidden</>}
                        </button>
                    </div>
                </div>
            </div>

            <div style={S.card}>
                <div style={S.cardHeader}><h3 style={S.cardTitle}>Branch Information</h3></div>
                <div style={S.cardBody}>
                    <div style={S.grid2}>
                        <div><p style={S.label}>Restaurant Name</p><p style={S.value}>{branch?.name || 'N/A'}</p></div>
                        <div><p style={S.label}>Branch Area</p><p style={S.value}>{branch?.branchName || branch?.city || 'N/A'}</p></div>
                        <div><p style={S.label}>Contact Phone</p><p style={S.value}>{branch?.phone || 'N/A'}</p></div>
                        <div><p style={S.label}>Email Address</p><p style={S.value}>{branch?.managerEmail || 'N/A'}</p></div>
                    </div>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <p style={S.label}>Full Business Address</p>
                        <p style={S.value}>{branch?.address || 'N/A'}, {branch?.city || ''}, {branch?.state || ''} {branch?.pincode || ''}</p>
                    </div>
                </div>
            </div>

            <div style={S.grid2}>
                <div style={S.card}>
                    <div style={S.cardHeader}><h3 style={S.cardTitle}>Legal & Compliance</h3></div>
                    <div style={S.cardBody}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><p style={S.label}>FSSAI License</p><p style={S.value}>{branch?.fssaiLicense || "N/A"}</p></div>
                            <div><p style={S.label}>GST Number</p><p style={S.value}>{branch?.gstNumber || "N/A"}</p></div>
                        </div>
                    </div>
                </div>
                <div style={S.card}>
                    <div style={S.cardHeader}><h3 style={S.cardTitle}>Settlement Bank Account</h3></div>
                    <div style={S.cardBody}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div><p style={S.label}>Account Holder</p><p style={S.value}>{branch?.bankAccountName || "N/A"}</p></div>
                            <div><p style={S.label}>Account Number</p><p style={S.value}>•••• •••• {branch?.bankAccountNumber?.slice(-4) || "XXXX"}</p></div>
                            <div><p style={S.label}>IFSC Code</p><p style={S.value}>{branch?.bankIfscCode || "N/A"}</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}
