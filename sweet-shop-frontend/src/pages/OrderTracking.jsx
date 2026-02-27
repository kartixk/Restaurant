import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { CheckCircle2, ChefHat, PackageCheck, Receipt } from "lucide-react";
import "./OrderTracking.css";

export default function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Poll for order status
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/user/orders/${orderId}`);
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        // Simulate real-time polling or websocket
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) {
        return <div className="tracking-loading">Loading order details...</div>;
    }

    if (!order) {
        return (
            <div className="tracking-error">
                <h2>Order Not Found</h2>
                <button onClick={() => navigate("/")} className="btn-return">Return Home</button>
            </div>
        );
    }

    const steps = [
        { id: "RECEIVED", label: "Received", icon: Receipt },
        { id: "PREPARING", label: "Preparing", icon: ChefHat },
        { id: "READY", label: "Ready", icon: PackageCheck },
        { id: "COMPLETED", label: "Completed", icon: CheckCircle2 }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.status);
    const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

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

                <div className="tracking-type-badge">
                    {order.orderType === "DINE_IN" ? "🍽️ Dine In" : "🛍️ Takeaway"}
                </div>

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
                                        <div className="step-icon">
                                            <Icon size={24} />
                                        </div>
                                        <span className="step-label">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="order-details">
                    <h3>Order Details</h3>
                    <div className="items-list">
                        {order.items.map((item, i) => (
                            <div key={i} className="receipt-item">
                                <span className="r-qty">{item.quantity}x</span>
                                <span className="r-name">{item.productName}</span>
                                <span className="r-price">₹{item.totalPrice}</span>
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
