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
                            style={styles.inventoryItem}
                            key={manager.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div style={styles.inventoryInfo}>
                                <h3 style={styles.itemName}>{manager.name}</h3>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                    <span style={styles.catBadge}>{manager.email}</span>
                                    {manager.phone && (
                                        <span style={{ ...styles.catBadge, background: '#e0f2fe', color: '#0369a1' }}>
                                            📞 {manager.phone}
                                        </span>
                                    )}
                                </div>
                                <p style={styles.inStock}>
                                    Applied on: {new Date(manager.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div style={styles.inventoryControls}>
                                <button
                                    style={{
                                        ...styles.downloadButton,
                                        opacity: approving === manager.id ? 0.7 : 1,
                                        cursor: approving === manager.id ? "not-allowed" : "pointer",
                                        background: approving === manager.id ? '#94a3b8' : styles.downloadButton.background
                                    }}
                                    onClick={() => handleApprove(manager.id)}
                                    disabled={approving === manager.id}
                                >
                                    {approving === manager.id ? "Processing..." : "Grant Access"}
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
