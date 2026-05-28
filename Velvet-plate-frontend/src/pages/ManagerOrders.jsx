// src/pages/ManagerOrders.jsx
import React, { useState, useEffect, useCallback } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { RefreshCw, Clock, CheckCircle, XCircle, ChefHat, Bell } from "lucide-react";

const STATUS_CONFIG = {
    RECEIVED:  { label: "Received",  textColor: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", hex: "#4f46e5", icon: Bell },
    PREPARING: { label: "Preparing", textColor: "#b45309", bg: "#fffbeb", border: "#fde68a", hex: "#d97706", icon: ChefHat },
    READY:     { label: "Ready",     textColor: "#047857", bg: "#f0fdf4", border: "#a7f3d0", hex: "#059669", icon: CheckCircle },
    COMPLETED: { label: "Completed", textColor: "#475569", bg: "#f8fafc", border: "#e2e8f0", hex: "#64748b", icon: Clock },
    CANCELLED: { label: "Cancelled", textColor: "#b91c1c", bg: "#fef2f2", border: "#fecaca", hex: "#ef4444", icon: XCircle },
};

const NEXT_STATUS = { RECEIVED: "PREPARING", PREPARING: "READY", READY: "COMPLETED" };

export default function ManagerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get("/orders/my-branch-orders");
            setOrders(res.data || []);
        } catch (err) {
            if (err.response?.status !== 404) toast.error("Failed to load orders");
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchOrders();
        const id = setInterval(fetchOrders, 30000);
        return () => clearInterval(id);
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            toast.success(`Order → ${STATUS_CONFIG[newStatus]?.label}`);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) { toast.error(err.response?.data?.error || "Failed to update status"); }
        finally { setUpdating(null); }
    };

    const formatDate = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    const activeOrders = orders.filter(o => !["COMPLETED", "CANCELLED"].includes(o.status));
    const archiveOrders = orders.filter(o => ["COMPLETED", "CANCELLED"].includes(o.status));

    return (
        <ManagerLayout>
            <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "40px", boxSizing: "border-box" }}>
                {/* Heading */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Orders</h1>
                        <p className="text-slate-500 text-sm font-medium">Real-time order management for your kitchen.</p>
                    </div>
                    <button
                        onClick={() => { setLoading(true); fetchOrders(); }}
                        className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={{ background: "white", border: "1px solid #e2e8f0", color: "#475569", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>

                {/* Status pill summary row */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
                        const count = orders.filter(o => o.status === s).length;
                        const StatusIcon = cfg.icon;
                        return (
                            <div
                                key={s}
                                className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.textColor }}
                            >
                                <StatusIcon size={13} />
                                {cfg.label}
                                <span
                                    className="font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-white text-[10px]"
                                    style={{ background: cfg.hex }}
                                >
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <RefreshCw size={32} className="animate-spin mb-3" />
                        <span className="text-sm font-semibold">Loading orders...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ background: "white", border: "1px dashed #e2e8f0", borderRadius: "20px", padding: "80px 40px", textAlign: "center" }}>
                        <div className="flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ width: "60px", height: "60px", background: "linear-gradient(135deg,#fff7ed,#ffedd5)" }}>
                            <Bell size={26} style={{ color: "#f97316" }} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Orders Yet</h3>
                        <p className="text-slate-400 text-sm font-medium">New orders will appear here automatically when customers place them.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10 pb-20">
                        {activeOrders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-lg font-extrabold text-slate-900">Active Orders</h2>
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold" style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", color: "white" }}>{activeOrders.length}</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {activeOrders.map(order => <OrderCard key={order.id} order={order} updating={updating} onStatusUpdate={handleStatusUpdate} formatDate={formatDate} />)}
                                </div>
                            </section>
                        )}
                        {archiveOrders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-lg font-bold text-slate-400">Order History</h2>
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold" style={{ background: "#f1f5f9", color: "#94a3b8" }}>{archiveOrders.length}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {archiveOrders.map(order => <OrderCard key={order.id} order={order} updating={updating} onStatusUpdate={handleStatusUpdate} formatDate={formatDate} archived />)}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </ManagerLayout>
    );
}

function OrderCard({ order, updating, onStatusUpdate, formatDate, archived = false }) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.RECEIVED;
    const nextStatus = NEXT_STATUS[order.status];
    const total = order.orderTotal ?? order.items?.reduce((s, i) => s + (i.totalPrice ?? i.price * i.quantity), 0) ?? 0;
    const StatusIcon = cfg.icon;

    return (
        <div
            style={{
                background: "white",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: archived ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
                border: archived ? "1px solid #f1f5f9" : "1px solid " + cfg.border,
                opacity: archived ? 0.65 : 1,
                transition: "box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={e => { if (!archived) e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { if (!archived) e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)"; }}
        >
            {/* Card Header */}
            <div
                style={{
                    padding: "16px 24px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid #f8fafc",
                    ...(archived ? {} : { background: cfg.bg, borderLeft: `4px solid ${cfg.hex}` }),
                }}
            >
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <p className="text-sm font-extrabold text-slate-900">#{(order.id || "").slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.textColor }}>
                        <StatusIcon size={12} /> {cfg.label}
                    </div>
                    <div
                        className="text-xs font-bold px-3 py-1.5 rounded-full"
                        style={order.orderType === "DINE_IN"
                            ? { background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" }
                            : { background: "#f0fdf4", border: "1px solid #a7f3d0", color: "#065f46" }
                        }
                    >
                        {order.orderType === "DINE_IN" ? "🍽 Dine-in" : "📦 Takeaway"}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xl font-extrabold text-slate-900">₹{total.toLocaleString("en-IN")}</span>
                    {nextStatus && !archived && (
                        <button
                            onClick={() => onStatusUpdate(order.id, nextStatus)}
                            disabled={updating === order.id}
                            style={{
                                padding: "8px 18px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                background: cfg.hex,
                                opacity: updating === order.id ? 0.6 : 1,
                                boxShadow: `0 3px 10px ${cfg.hex}40`,
                                transition: "opacity 0.2s",
                            }}
                        >
                            {updating === order.id ? "..." : `Mark ${STATUS_CONFIG[nextStatus]?.label} →`}
                        </button>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "160px 1fr", gap: "24px" }}>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                    {order.user ? (
                        <><p className="text-sm font-bold text-slate-900">{order.user.name}</p><p className="text-xs text-slate-400 font-medium">{order.user.email}</p></>
                    ) : <p className="text-xs text-slate-400 font-medium">Guest Order</p>}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items</p>
                    <div className="flex flex-col gap-2">
                        {(order.items || []).map((item, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center rounded-xl"
                                style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #f1f5f9" }}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className="flex items-center justify-center rounded-lg text-xs font-extrabold text-slate-700"
                                        style={{ width: "26px", height: "26px", background: "white", border: "1px solid #e2e8f0" }}
                                    >
                                        {item.quantity}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-900">{item.productName}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-600">₹{(item.totalPrice ?? item.price * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
