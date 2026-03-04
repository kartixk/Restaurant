import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { CheckCircle2, ChefHat, PackageCheck, Receipt } from "lucide-react";
import { toast } from "react-toastify";

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

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white/50 font-black gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
            <span className="animate-pulse tracking-widest text-xs uppercase">Connecting to kitchen...</span>
        </div>
    );

    if (!order) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                    <Receipt size={40} className="text-slate-700" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Order Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm">We couldn't find the order you're looking for. It might have been cleared or the link is invalid.</p>
                <button
                    onClick={() => navigate("/")}
                    className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-200 transition-colors shadow-xl shadow-white/5"
                >
                    Return to Home
                </button>
            </div>
        );
    }

    const steps = [
        { id: "RECEIVED", label: "Order Received", icon: Receipt },
        { id: "PREPARING", label: "Preparation", icon: ChefHat },
        { id: "READY", label: "Ready", icon: PackageCheck },
        { id: "COMPLETED", label: "Collected", icon: CheckCircle2 },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === order.status);
    const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;
    const isReady = order.status === "READY";

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 md:p-12 bg-slate-950 font-sans">
            <motion.div
                className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-950/50 border border-slate-100 overflow-hidden"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight m-0">Live Tracking</h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Real-time status of your meal</p>
                    </div>
                    <span className="text-xs font-black text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl uppercase tracking-widest">
                        #{order.id.slice(-6).toUpperCase()}
                    </span>
                </div>

                <div className="flex flex-wrap gap-3 mb-12">
                    <div className={`inline-flex items-center px-5 py-2.5 rounded-2xl text-xs font-black ring-1 ring-inset ${order.orderType === "DINE_IN"
                            ? "bg-orange-50 text-orange-600 ring-orange-100"
                            : "bg-blue-50 text-blue-600 ring-blue-100"
                        }`}>
                        {order.orderType === "DINE_IN" ? "🍽️ DINE IN" : "🛍️ TAKEAWAY"}
                    </div>
                    {order.branch?.name && (
                        <div className="inline-flex items-center px-5 py-2.5 rounded-2xl text-xs font-black bg-slate-50 text-slate-500 ring-1 ring-slate-100 ring-inset">
                            🏪 {order.branch.name.toUpperCase()}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isReady && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-10 flex items-center gap-6 shadow-sm shadow-emerald-500/5"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm">🔔</div>
                            <div>
                                <h4 className="font-black text-emerald-900 m-0 text-lg">Your order is ready!</h4>
                                <p className="text-emerald-700/70 m-0 font-bold text-sm mt-0.5">
                                    Please head to the counter and show your order ID.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {order.status === "CANCELLED" ? (
                    <div className="text-center p-12 bg-red-50 rounded-[2rem] border border-red-100 mb-10">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h2 className="text-red-600 font-black text-2xl m-0">Order Cancelled</h2>
                        <p className="text-red-400 font-bold text-sm mt-2">Please contact our staff for assistance regarding your order.</p>
                    </div>
                ) : (
                    <div className="relative my-16 px-2">
                        {/* Progress line */}
                        <div className="absolute top-7 left-10 right-10 h-1.5 bg-slate-100 rounded-full z-0">
                            <motion.div
                                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                            />
                        </div>

                        <div className="flex justify-between relative z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-4 w-20 md:w-24 group">
                                        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${isCurrent
                                                ? "bg-emerald-500 border-white text-white shadow-xl shadow-emerald-500/40 scale-110"
                                                : isActive
                                                    ? "bg-emerald-50 border-white text-emerald-500"
                                                    : "bg-slate-50 border-white text-slate-300"
                                            } z-20`}>
                                            <Icon size={isCurrent ? 24 : 20} className={isCurrent ? "animate-pulse" : ""} />
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter text-center transition-colors duration-500 ${isCurrent ? "text-slate-900" : isActive ? "text-emerald-600" : "text-slate-300"
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <AnimatePresence>
                    {isReady && (
                        <motion.button
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCollect}
                            disabled={collecting}
                            className={`w-full py-5 rounded-2xl text-base font-black transition-all mb-8 shadow-2xl flex items-center justify-center gap-3 ${collecting
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25 active:scale-[0.98]"
                                }`}
                        >
                            {collecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "✅ I've Collected My Order"
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="bg-slate-50/80 rounded-[2rem] p-8 md:p-10 border border-slate-100 mb-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Receipt size={18} className="text-slate-400" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 m-0 uppercase tracking-tight">Order Details</h3>
                    </div>
                    <div className="space-y-5">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 h-6 bg-slate-200/50 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">
                                        {item.quantity}
                                    </span>
                                    <span className="font-bold text-slate-700">{item.productName}</span>
                                </div>
                                <span className="font-black text-slate-900">₹{item.totalPrice ?? item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 flex justify-between items-end">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Amount Paid</span>
                        <span className="text-3xl font-black text-slate-950 leading-none">₹{order.orderTotal}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="w-full py-5 bg-slate-950 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all active:scale-[0.99] shadow-xl shadow-slate-950/20"
                >
                    Back to Menu
                </button>
            </motion.div>
        </div>
    );
}
