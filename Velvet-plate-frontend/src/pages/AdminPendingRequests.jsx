import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBranches } from "../hooks/useBranches";
import api from "../api/axios";
import { toast } from "react-toastify";
import { ExternalLink } from "lucide-react";

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#F1F5F9",
        fontFamily: "'Inter', sans-serif",
        padding: "0",
    },
    topBar: {
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E2E8F0",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    topBarLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    backBtn: {
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "8px 14px",
        cursor: "pointer",
        fontWeight: 600,
        color: "#64748B",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s",
    },
    pageTitle: {
        fontSize: "1.5rem",
        fontWeight: 800,
        color: "#0F172A",
        margin: 0,
        letterSpacing: "-0.02em",
    },
    pageSubtitle: {
        fontSize: "0.85rem",
        color: "#64748B",
        margin: "2px 0 0",
    },
    statPill: {
        backgroundColor: "#FFF7F0",
        borderRadius: "100px",
        border: "1px solid #FFD9BF",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    statNum: {
        fontSize: "1.5rem",
        fontWeight: 900,
        color: "#FF5A00",
        lineHeight: 1,
    },
    statLabel: {
        fontSize: "0.75rem",
        color: "#94A3B8",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    body: {
        padding: "32px 40px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
        gap: "24px",
    },
    card: {
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden",
    },
    cardHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    avatar: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #FF5A00 0%, #E04E00 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 900,
        fontSize: "1.2rem",
        flexShrink: 0,
        boxShadow: "0 4px 10px rgba(255,90,0,0.2)",
    },
    managerName: {
        fontWeight: 800,
        fontSize: "1.1rem",
        color: "#0F172A",
        margin: "0 0 2px",
        letterSpacing: "-0.01em",
    },
    badgeRow: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        marginTop: "4px",
    },
    badge: {
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "100px",
        backgroundColor: "#F1F5F9",
        color: "#64748B",
        border: "1px solid #E2E8F0",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    newBadge: {
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "100px",
        backgroundColor: "#FEF2F2",
        color: "#EF4444",
        border: "1px solid #FEE2E2",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    contactRow: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#64748B",
        fontSize: "0.85rem",
        marginBottom: "4px",
    },
    cardBody: {
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    section: {
        borderRadius: "12px",
        border: "1px solid #F1F5F9",
        backgroundColor: "#F8FAFC",
        padding: "14px 16px",
    },
    sectionTitle: {
        fontSize: "0.7rem",
        fontWeight: 800,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
    },
    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "1px",
    },
    infoLabel: {
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    infoValue: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#0F172A",
    },
    bankBlock: {
        background: "#1E293B",
        borderRadius: "10px",
        padding: "12px 14px",
        marginTop: "10px",
    },
    bankLabel: {
        fontSize: "0.68rem",
        fontWeight: 700,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "8px",
    },
    bankGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
    },
    bankItemLabel: {
        fontSize: "0.65rem",
        fontWeight: 700,
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    },
    bankItemValue: {
        fontSize: "0.82rem",
        fontWeight: 700,
        color: "#F1F5F9",
    },
    cardFooter: {
        padding: "14px 24px",
        borderTop: "1px solid #F1F5F9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    submittedDate: {
        fontSize: "0.76rem",
        color: "#94A3B8",
        fontWeight: 500,
    },
    actionBtns: {
        display: "flex",
        gap: "8px",
    },
    rejectBtn: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid #FEE2E2",
        backgroundColor: "white",
        color: "#EF4444",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.82rem",
        transition: "all 0.2s",
    },
    approveBtn: {
        padding: "8px 20px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#FF5A00",
        color: "white",
        fontWeight: 800,
        cursor: "pointer",
        fontSize: "0.82rem",
        boxShadow: "0 4px 10px rgba(255,90,0,0.2)",
        transition: "all 0.2s",
    },
    emptyState: {
        backgroundColor: "white",
        borderRadius: "20px",
        border: "1px solid #E2E8F0",
        padding: "80px 20px",
        textAlign: "center",
        gridColumn: "1 / -1",
    },
    docLabel: {
        fontSize: "0.85rem",
        fontWeight: 800,
        color: "#0F172A",
        margin: "0 0 12px",
    },
    docList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    docCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: "white",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        transition: "all 0.2s",
    },
    docName: {
        fontSize: "0.85rem",
        fontWeight: 700,
        color: "#0F172A",
    },
    docViewBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.80rem",
        fontWeight: 700,
        color: "#3B82F6",
        textDecoration: "none",
        transition: "opacity 0.2s",
    },
};

function InfoRow({ label, value, full = false }) {
    return (
        <div style={full ? { ...styles.infoItem, gridColumn: "1 / -1" } : styles.infoItem}>
            <span style={styles.infoLabel}>{label}</span>
            <span style={styles.infoValue}>{value || "N/A"}</span>
        </div>
    );
}

function DocLink({ label, url }) {
    if (!url) return null;

    // Use absolute URL if it starts with http, otherwise prepend backend URL
    const fullUrl = url.startsWith("http") ? url : `http://localhost:4000${url}`;

    return (
        <div style={styles.docCard}>
            <span style={styles.docName}>{label}</span>
            <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.docViewBtn}
                onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
                View <ExternalLink size={14} />
            </a>
        </div>
    );
}

export default function AdminPendingRequests() {
    const navigate = useNavigate();
    const { data: dbBranches = [], refetch: refetchBranches } = useBranches();

    const pendingStores = useMemo(() =>
        dbBranches.filter(b => b.storeStatus === "under_review"),
        [dbBranches]);

    const handleApprove = async (id) => {
        try {
            await api.put(`/branches/${id}/verify`, { status: "verified" });
            toast.success("Store approved! Verification email sent.");
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
        <div style={styles.page}>
            {/* Top Bar */}
            <div style={styles.topBar}>
                <div style={styles.topBarLeft}>
                    <button style={styles.backBtn} onClick={() => navigate("/admin")}>
                        ← Back
                    </button>
                    <div>
                        <h1 style={styles.pageTitle}>Manager Applications</h1>
                        <p style={styles.pageSubtitle}>Review and verify new restaurant partner applications</p>
                    </div>
                </div>
                <div style={styles.statPill}>
                    <div>
                        <div style={styles.statNum}>{pendingStores.length}</div>
                    </div>
                    <div style={styles.statLabel}>Awaiting Review</div>
                </div>
            </div>

            {/* Body */}
            <div style={styles.body}>
                <div style={styles.grid}>
                    {pendingStores.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✅</div>
                            <h3 style={{ color: "#0F172A", fontWeight: 800, margin: "0 0 8px" }}>All caught up!</h3>
                            <p style={{ color: "#64748B", margin: 0 }}>No pending store applications at the moment.</p>
                        </div>
                    ) : (
                        pendingStores.map((store) => (
                            <div key={store.id} style={styles.card}>
                                {/* Card Header */}
                                <div style={styles.cardHeader}>
                                    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                                        <div
                                            style={{
                                                ...styles.avatar,
                                                backgroundImage: store.managerPhotoUrl ? `url(${store.managerPhotoUrl.startsWith('http') ? store.managerPhotoUrl : `http://localhost:4000${store.managerPhotoUrl}`})` : "none",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                color: store.managerPhotoUrl ? "transparent" : "white"
                                            }}
                                        >
                                            {!store.managerPhotoUrl && (store.manager?.name || "M")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={styles.managerName}>{store.manager?.name || "Unknown Manager"}</p>
                                            <div style={styles.badgeRow}>
                                                <span style={styles.badge}>#{store.id?.slice(-6).toUpperCase()}</span>
                                                <span style={styles.newBadge}>New</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right", color: "#64748B", fontSize: "0.82rem" }}>
                                        <div style={styles.contactRow}>
                                            📧 {store.manager?.email || "No email"}
                                        </div>
                                        <div style={styles.contactRow}>
                                            📞 {store.phone || store.manager?.phone || "No phone"}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div style={styles.cardBody}>
                                    {/* Store Details */}
                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>
                                            🏪 Store Details
                                        </div>
                                        <div style={styles.infoGrid}>
                                            <InfoRow label="Restaurant Name" value={store.name} />
                                            <InfoRow label="Branch" value={store.branchName} />
                                            <InfoRow label="City" value={store.city} />
                                            <InfoRow label="State" value={store.state} />
                                            <InfoRow label="Pincode" value={store.pincode} />
                                            <InfoRow label="Hours" value={store.openTime && store.closeTime ? `${store.openTime} – ${store.closeTime}` : null} />
                                            <InfoRow label="Address" value={store.address} full />
                                        </div>
                                    </div>

                                    {/* Legal */}
                                    <div style={styles.section}>
                                        <div style={styles.sectionTitle}>
                                            📋 Legal & Tax
                                        </div>
                                        <div style={styles.infoGrid}>
                                            <InfoRow label="GST Number" value={store.gstNumber} />
                                            <InfoRow label="FSSAI License" value={store.fssaiLicense} />
                                        </div>

                                        {/* Bank Block */}
                                        <div style={styles.bankBlock}>
                                            <div style={styles.bankLabel}>🏦 Bank Account</div>
                                            <div style={styles.bankGrid}>
                                                <div>
                                                    <div style={styles.bankItemLabel}>Account Holder</div>
                                                    <div style={styles.bankItemValue}>{store.bankAccountName || "N/A"}</div>
                                                </div>
                                                <div>
                                                    <div style={styles.bankItemLabel}>IFSC Code</div>
                                                    <div style={{ ...styles.bankItemValue, color: "#FB923C" }}>{store.bankIfscCode || "N/A"}</div>
                                                </div>
                                                <div style={{ gridColumn: "1 / -1" }}>
                                                    <div style={styles.bankItemLabel}>Account Number</div>
                                                    <div style={styles.bankItemValue}>{store.bankAccountNumber || "N/A"}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div style={{ ...styles.section, border: "none", padding: "0" }}>
                                        <div style={styles.docLabel}>Documents</div>
                                        <div style={styles.docList}>
                                            <DocLink label="FSSAI License" url={store.fssaiPdfUrl} />
                                            <DocLink label="GST Certificate" url={store.gstPdfUrl} />
                                            <DocLink label="Bank Passbook" url={store.bankPassbookPdfUrl} />
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div style={styles.cardFooter}>
                                    <div style={styles.submittedDate}>
                                        🕐 Submitted on {formatDate(store.createdAt)}
                                    </div>
                                    <div style={styles.actionBtns}>
                                        <button style={styles.rejectBtn} onClick={() => handleReject(store.id)}>
                                            ✕ Reject
                                        </button>
                                        <button style={styles.approveBtn} onClick={() => handleApprove(store.id)}>
                                            ✓ Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
