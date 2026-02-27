// src/pages/ManagerOrders.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Clock, CheckCircle, AlertCircle, Play, StopCircle, Eye } from "lucide-react";

export default function ManagerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders/my-branch-orders");
            setOrders(res.data || []);
        } catch (err) {
            // Ignore 404 for new managers
            if (err.response?.status !== 404) {
                console.error("Failed to sync orders:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const buckets = ["ACTIVE", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

    const getS = (status) => {
        switch (status) {
            case 'READY': return { color: '#059669', bg: '#ecfdf5' };
            case 'PREPARING': return { color: '#d97706', bg: '#fef3c7' };
            default: return { color: '#6366f1', bg: '#e0e7ff' };
        }
    };

    return (
        <ManagerLayout title="Order Board" subtitle="Real-time Kitchen Display System (KDS) for managing active orders.">
            <div style={{ display: "flex", gap: "1.25rem", overflowX: "auto", paddingBottom: "1.5rem", minHeight: "calc(100vh - 250px)" }}>
                {buckets.map(bucket => (
                    <div key={bucket} style={{ minWidth: "300px", maxWidth: "300px", backgroundColor: "#f1f5f9", borderRadius: "16px", padding: "1.25rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "0.75rem", borderBottom: "2px solid #cbd5e1", display: 'flex', justifyContent: 'space-between' }}>
                            {bucket}
                            <span style={{ backgroundColor: "#cbd5e1", color: "#475569", padding: "2px 8px", borderRadius: "100px", fontSize: "0.75rem" }}>
                                {orders.filter(o => (o.status || 'ACTIVE') === bucket).length}
                            </span>
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                            {orders.filter(o => (o.status || 'ACTIVE') === bucket).map((order) => (
                                <div key={order._id} style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', borderLeft: `4px solid ${getS(bucket).color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', mb: '0.5rem' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', margin: '0.75rem 0' }}>
                                        {order.items.map(item => (
                                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{item.quantity}x {item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", marginTop: '1rem' }}>
                                        <button style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Update Status</button>
                                        <button style={{ padding: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}><Eye size={14} /></button>
                                    </div>
                                </div>
                            ))}

                            {orders.filter(o => (o.status || 'ACTIVE') === bucket).length === 0 && (
                                <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8", fontSize: "0.85rem" }}>No orders</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ManagerLayout>
    );
}
