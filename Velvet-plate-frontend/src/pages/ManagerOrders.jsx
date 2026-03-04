// src/pages/ManagerOrders.jsx
import React, { useState, useEffect, useCallback } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
    RECEIVED: { label: "Received", textCls: "text-indigo-700", bgCls: "bg-indigo-50", borderCls: "border-indigo-200", hex: "#4f46e5" },
    PREPARING: { label: "Preparing", textCls: "text-amber-700", bgCls: "bg-amber-50", borderCls: "border-amber-200", hex: "#d97706" },
    READY: { label: "Ready", textCls: "text-emerald-700", bgCls: "bg-emerald-50", borderCls: "border-emerald-200", hex: "#059669" },
    COMPLETED: { label: "Completed", textCls: "text-slate-500", bgCls: "bg-slate-50", borderCls: "border-slate-200", hex: "#64748b" },
    CANCELLED: { label: "Cancelled", textCls: "text-red-700", bgCls: "bg-red-50", borderCls: "border-red-200", hex: "#ef4444" },
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
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Orders</h1>
                        <p className="text-base text-slate-500 font-medium">Real-time order management for your kitchen.</p>
                    </div>
                    <button
                        onClick={() => { setLoading(true); fetchOrders(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold cursor-pointer transition-all shadow-sm hover:bg-slate-50"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Status pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                        <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.bgCls} ${cfg.textCls} ${cfg.borderCls}`}>
                            {cfg.label}: <span className="font-extrabold">{orders.filter(o => o.status === s).length}</span>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400 font-medium">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-20 flex flex-col items-center text-center shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Orders Yet</h3>
                        <p className="text-slate-400 text-sm font-medium">New orders will appear here automatically when customers place them.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12 pb-20">
                        {activeOrders.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Active ({activeOrders.length})</h2>
                                <div className="flex flex-col gap-4">
                                    {activeOrders.map(order => <OrderCard key={order.id} order={order} updating={updating} onStatusUpdate={handleStatusUpdate} formatDate={formatDate} />)}
                                </div>
                            </section>
                        )}
                        {archiveOrders.length > 0 && (
                            <section>
                                <h2 className="text-lg font-bold text-slate-500 mb-4">History ({archiveOrders.length})</h2>
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

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all ${archived ? "opacity-60" : "hover:shadow-md"}`}>
            <div className={`px-6 py-4 flex flex-wrap justify-between items-center gap-4 ${!archived ? "border-l-4" : ""}`} style={{ borderLeftColor: archived ? undefined : cfg.hex }}>
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <p className="text-base font-extrabold text-slate-900 tracking-tight">#{(order.id || "").slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bgCls} ${cfg.textCls} ${cfg.borderCls}`}>{cfg.label}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.orderType === "DINE_IN" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xl font-extrabold text-slate-900">₹{total.toLocaleString("en-IN")}</span>
                    {nextStatus && !archived && (
                        <button
                            onClick={() => onStatusUpdate(order.id, nextStatus)}
                            disabled={updating === order.id}
                            className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer hover:opacity-90"
                            style={{ backgroundColor: cfg.hex }}
                        >
                            {updating === order.id ? "..." : `Mark ${STATUS_CONFIG[nextStatus]?.label} →`}
                        </button>
                    )}
                </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                    {order.user ? (
                        <><p className="text-sm font-bold text-slate-900">{order.user.name}</p><p className="text-xs text-slate-400 font-medium">{order.user.email}</p></>
                    ) : <p className="text-xs text-slate-400 font-medium">Guest Order</p>}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items</p>
                    <div className="flex flex-col gap-1.5">
                        {(order.items || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">{item.quantity}</span>
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
