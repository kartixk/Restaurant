import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { CheckCircle2, ChefHat, PackageCheck, Receipt, Bell } from "lucide-react";
import { toast } from "react-toastify";
import "./OrderTracking.css";

export default function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [collecting, setCollecting] = useState(false);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data);
        } catch (err) {
            console.error("Failed to fetch order", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    const handleCollect = async () => {
        setCollecting(true);
        try {
            await api.put(`/orders/${orderId}/collect`);
            toast.success("🎉 Thanks! Order marked as collected.");
            setOrder(prev => ({ ...prev, status: "COMPLETED" }));
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to mark as collected");
        } finally {
            setCollecting(false);
        }
    };

    if (loading) return <div className="tracking-loading">Loading order details...</div>;

    if (!order) {
        return (
            <div className="tracking-error">
                <h2>Order Not Found</h2>
                <button onClick={() => navigate("/")} className="btn-return">Return Home</button>
            </div>
        );
    }

    const steps = [
        { id: "RECEIVED", label: "Order Received", icon: Receipt },
        { id: "PREPARING", label: "Being Prepared", icon: ChefHat },
        { id: "READY", label: "Ready to Pick Up", icon: PackageCheck },
        { id: "COMPLETED", label: "Collected", icon: CheckCircle2 },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.status);
    const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;
    const isReady = order.status === "READY";

    return (
        <div className="tracking-container">
            <motion.div
                className="tracking-card"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="tracking-header">
                    <h1>Order Tracking</h1>
                    <span className="order-id">#{order.id.slice(-6).toUpperCase()}</span>
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                    <div className="tracking-type-badge">
                        {order.orderType === "DINE_IN" ? "🍽️ Dine In" : "🛍️ Takeaway"}
                    </div>
                    {order.branch?.name && (
                        <div className="tracking-type-badge" style={{ background: "#F1F5F9", color: "#475569" }}>
                            🏪 {order.branch.name}
                        </div>
                    )}
                </div>

                {/* Ready notification banner */}
                <AnimatePresence>
                    {isReady && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)",
                                border: "1px solid #6EE7B7",
                                borderRadius: 16,
                                padding: "20px 24px",
                                marginBottom: 24,
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                            }}
                        >
                            <div style={{ fontSize: 36 }}>🔔</div>
                            <div>
                                <p style={{ fontWeight: 800, color: "#065F46", margin: "0 0 4px", fontSize: "1rem" }}>
                                    Your order is ready!
                                </p>
                                <p style={{ color: "#047857", margin: 0, fontSize: "0.85rem" }}>
                                    Please head to the counter and collect your order.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {order.status === "CANCELLED" ? (
                    <div className="cancelled-state">
                        <h2 className="text-danger">Order Cancelled</h2>
                        <p>Please contact staff for assistance.</p>
                    </div>
                ) : (
                    <div className="tracker-component">
                        <div className="progress-bar-bg">
                            <motion.div
                                className="progress-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <div className="steps-container">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div key={step.id} className={`step-item ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                                        <div className="step-icon"><Icon size={24} /></div>
                                        <span className="step-label">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Collect button — only visible when READY */}
                <AnimatePresence>
                    {isReady && (
                        <motion.button
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCollect}
                            disabled={collecting}
                            style={{
                                display: "block",
                                width: "100%",
                                padding: "16px",
                                background: collecting ? "#94A3B8" : "linear-gradient(135deg, #10B981, #059669)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 14,
                                fontSize: "1rem",
                                fontWeight: 800,
                                cursor: collecting ? "not-allowed" : "pointer",
                                margin: "16px 0",
                                boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
                                transition: "all 0.2s",
                            }}
                        >
                            {collecting ? "Processing..." : "✅ I've Collected My Order"}
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="order-details">
                    <h3>Order Details</h3>
                    <div className="items-list">
                        {order.items.map((item, i) => (
                            <div key={i} className="receipt-item">
                                <span className="r-qty">{item.quantity}x</span>
                                <span className="r-name">{item.productName}</span>
                                <span className="r-price">₹{item.totalPrice ?? item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="receipt-total">
                        <span>Total</span>
                        <span>₹{order.orderTotal}</span>
                    </div>
                </div>

                <button onClick={() => navigate("/")} className="btn-return">
                    Back to Menu
                </button>
            </motion.div>
        </div>
    );
}
