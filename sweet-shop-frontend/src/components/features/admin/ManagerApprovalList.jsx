import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { adminStyles as styles } from "./AdminStyles";

export default function ManagerApprovalList() {
    const [pendingManagers, setPendingManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(null);

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

    useEffect(() => {
        fetchPendingManagers();
    }, []);

    const handleApprove = async (id) => {
        setApproving(id);
        try {
            await api.put(`/admin/managers/${id}/approve`);
            toast.success("Manager approved successfully! Confirmation email sent.");
            fetchPendingManagers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to approve manager");
        } finally {
            setApproving(null);
        }
    };

    return (
        <motion.div style={styles.glassCardSmall} layout>
            <div style={styles.cardHeader}>
                <div>
                    <h2 style={styles.sectionTitle}>Branch Manager Approvals</h2>
                    <p style={styles.sectionSubtitle}>Review and authorize new branch managers</p>
                </div>
                <div style={styles.dateBadge}>
                    {pendingManagers.length} Awaiting
                </div>
            </div>

            <div style={styles.inventoryListScroll}>
                {loading ? (
                    <div style={styles.loadingContainer}>
                        <div style={styles.spinner}></div>
                        <p>Loading...</p>
                    </div>
                ) : pendingManagers.length === 0 ? (
                    <div style={styles.emptyInventory}>No pending manager registrations</div>
                ) : (
                    pendingManagers.map((manager) => (
                        <motion.div
                            style={{ ...styles.inventoryItem, alignItems: 'flex-start', padding: '1.5rem' }}
                            key={manager.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {/* Manager Photo */}
                            <div style={{
                                width: '64px', height: '64px', borderRadius: '12px',
                                background: manager.managedBranch?.managerPhotoUrl
                                    ? `url(http://localhost:4000${manager.managedBranch.managerPhotoUrl}) center/cover`
                                    : '#f1f5f9',
                                border: '1px solid #e2e8f0', flexShrink: 0, marginRight: '1rem'
                            }} />

                            <div style={{ ...styles.inventoryInfo, flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={styles.itemName}>{manager.name}</h3>
                                        <p style={{ ...styles.sectionSubtitle, margin: '2px 0 8px 0', fontSize: '0.85rem' }}>
                                            {manager.managedBranch?.name || 'New Branch'} - {manager.managedBranch?.branchName || 'TBD'}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        Applied: {new Date(manager.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <span style={styles.catBadge}>{manager.email}</span>
                                    {manager.phone && <span style={{ ...styles.catBadge, background: '#f0fdf4', color: '#16a34a' }}>📞 {manager.phone}</span>}
                                    {manager.managedBranch?.fssaiLicense && <span style={{ ...styles.catBadge, background: '#fff7ed', color: '#c2410c' }}>FSSAI: {manager.managedBranch.fssaiLicense}</span>}
                                </div>

                                {/* Document Links */}
                                <div style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <a
                                        href={manager.managedBranch?.fssaiPdfUrl ? `http://localhost:4000${manager.managedBranch.fssaiPdfUrl}` : '#'}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: manager.managedBranch?.fssaiPdfUrl ? '#FF5A00' : '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        📄 FSSAI Document
                                    </a>
                                    <a
                                        href={manager.managedBranch?.gstPdfUrl ? `http://localhost:4000${manager.managedBranch.gstPdfUrl}` : '#'}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: manager.managedBranch?.gstPdfUrl ? '#FF5A00' : '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        📄 GST Certificate
                                    </a>
                                    <a
                                        href={manager.managedBranch?.bankPassbookPdfUrl ? `http://localhost:4000${manager.managedBranch.bankPassbookPdfUrl}` : '#'}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: manager.managedBranch?.bankPassbookPdfUrl ? '#FF5A00' : '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        📄 Bank Passbook
                                    </a>
                                </div>
                            </div>

                            <div style={{ ...styles.inventoryControls, marginLeft: '1rem', alignSelf: 'center' }}>
                                <button
                                    style={{
                                        ...styles.downloadButton,
                                        opacity: approving === manager.id ? 0.7 : 1,
                                        cursor: approving === manager.id ? "not-allowed" : "pointer",
                                        background: approving === manager.id ? '#94a3b8' : styles.downloadButton.background,
                                        padding: '10px 20px', fontSize: '0.85rem'
                                    }}
                                    onClick={() => handleApprove(manager.id)}
                                    disabled={approving === manager.id}
                                >
                                    {approving === manager.id ? "Approving..." : "Authorize"}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
