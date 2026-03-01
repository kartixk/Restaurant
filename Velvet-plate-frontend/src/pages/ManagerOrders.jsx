import React, { useState, useEffect, useCallback } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Clock, Package, ChevronDown, RefreshCw } from "lucide-react";

const STATUS_CONFIG = {
    RECEIVED: { label: "Received", color: "#6366F1", bg: "#EEF2FF" },
    PREPARING: { label: "Preparing", color: "#D97706", bg: "#FEF3C7" },
    READY: { label: "Ready", color: "#059669", bg: "#D1FAE5" },
    COMPLETED: { label: "Completed", color: "#64748B", bg: "#F1F5F9" },
    CANCELLED: { label: "Cancelled", color: "#EF4444", bg: "#FEF2F2" },
};

const NEXT_STATUS = {
    RECEIVED: "PREPARING",
    PREPARING: "READY",
    READY: "COMPLETED",
};

const ORDER_TYPE_CONFIG = {
    DINE_IN: { label: "Dine-in", color: "#F59E0B", bg: "#FEF3C7" },
    TAKEAWAY: { label: "Takeaway", color: "#10B981", bg: "#D1FAE5" },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.RECEIVED;
    return (
        <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px",
            borderRadius: "100px", backgroundColor: cfg.bg, color: cfg.color,
            letterSpacing: "0.04em", textTransform: "uppercase"
        }}>
            {cfg.label}
        </span>
    );
}

function OrderTypeBadge({ type }) {
    const cfg = ORDER_TYPE_CONFIG[type] || ORDER_TYPE_CONFIG.DINE_IN;
    return (
        <span style={{
            fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px",
            borderRadius: "100px", backgroundColor: cfg.bg, color: cfg.color,
        }}>
            {cfg.label}
        </span>
    );
}

export default function ManagerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get("/orders/my-branch-orders");
            setOrders(res.data || []);
        } catch (err) {
            if (err.response?.status !== 404) {
                toast.error("Failed to load orders");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order marked as ${STATUS_CONFIG[newStatus]?.label}`);
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
            );
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (d) =>
        new Date(d).toLocaleString("en-IN", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
        });

    const activeOrders = orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status));
    const archiveOrders = orders.filter(o => ["COMPLETED", "CANCELLED"].includes(o.status));

    return (
        <ManagerLayout title="Orders" subtitle="All orders placed at your restaurant, newest first.">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "10px 16px", display: "flex", gap: "10px" }}>
                        {Object.keys(STATUS_CONFIG).map(s => (
                            <span key={s} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", fontWeight: 600, color: "#64748B" }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_CONFIG[s].color, display: "inline-block" }} />
                                {STATUS_CONFIG[s].label}: {orders.filter(o => o.status === s).length}
                            </span>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchOrders(); }}
                    style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, color: "#64748B" }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#94A3B8" }}>
                    <RefreshCw size={32} style={{ animation: "spin 1s linear infinite" }} />
                    <p>Loading orders…</p>
                </div>
            ) : orders.length === 0 ? (
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "80px 20px", textAlign: "center" }}>
                    <Package size={48} color="#CBD5E1" style={{ marginBottom: 12 }} />
                    <h3 style={{ margin: 0, color: "#0F172A", fontWeight: 700 }}>No orders yet</h3>
                    <p style={{ color: "#94A3B8", margin: "8px 0 0" }}>Orders from your restaurant will appear here.</p>
                </div>
            ) : (
                <>
                    {/* Active Orders */}
                    {activeOrders.length > 0 && (
                        <div style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
                                Active — {activeOrders.length}
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {activeOrders.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        updating={updating}
                                        onStatusUpdate={handleStatusUpdate}
                                        formatDate={formatDate}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed / Cancelled */}
                    {archiveOrders.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
                                Completed / Cancelled — {archiveOrders.length}
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {archiveOrders.map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        updating={updating}
                                        onStatusUpdate={handleStatusUpdate}
                                        formatDate={formatDate}
                                        archived
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </ManagerLayout>
    );
}

function OrderCard({ order, updating, onStatusUpdate, formatDate, archived = false }) {
    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEIVED;
    const nextStatus = NEXT_STATUS[order.status];

    const orderTotal = order.orderTotal ?? order.items?.reduce((sum, i) => sum + (i.totalPrice ?? i.price * i.quantity), 0) ?? 0;

    return (
        <div style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "16px",
            overflow: "hidden",
            borderLeft: `4px solid ${statusCfg.color}`,
            opacity: archived ? 0.7 : 1,
            transition: "all 0.2s",
        }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: "0.95rem", color: "#0F172A" }}>
                            #{(order.id || "").slice(-6).toUpperCase()}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}>
                            <Clock size={12} /> {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        <StatusBadge status={order.status} />
                        <OrderTypeBadge type={order.orderType} />
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0F172A" }}>
                        ₹{orderTotal.toLocaleString("en-IN")}
                    </span>
                    {nextStatus && !archived && (
                        <button
                            onClick={() => onStatusUpdate(order.id, nextStatus)}
                            disabled={updating === order.id}
                            style={{
                                padding: "8px 16px",
                                background: statusCfg.color,
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                opacity: updating === order.id ? 0.6 : 1,
                                transition: "all 0.2s",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            {updating === order.id ? (
                                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                                <>Mark as {STATUS_CONFIG[nextStatus]?.label} →</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Customer + Items */}
            <div style={{ padding: "16px 20px" }}>
                {order.user && (
                    <p style={{ margin: "0 0 12px", fontSize: "0.82rem", color: "#64748B" }}>
                        👤 <strong>{order.user.name}</strong> · {order.user.email}
                        {order.user.phone && ` · ${order.user.phone}`}
                    </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "8px 12px", background: "#F8FAFC", borderRadius: "8px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{
                                    background: "#E2E8F0", color: "#475569", fontWeight: 800,
                                    fontSize: "0.78rem", borderRadius: "6px", padding: "2px 8px"
                                }}>×{item.quantity}</span>
                                <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#0F172A" }}>
                                    {item.productName}
                                </span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#475569" }}>
                                ₹{(item.totalPrice ?? item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
