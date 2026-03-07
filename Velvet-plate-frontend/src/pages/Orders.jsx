import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { Receipt, ChevronRight, Clock, MapPin, Search } from "lucide-react";
import { toast } from "react-toastify";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get("/orders");
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders", err);
                toast.error("Could not load your orders. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "RECEIVED": return "bg-blue-50 text-blue-600 ring-blue-100";
            case "PREPARING": return "bg-orange-50 text-orange-600 ring-orange-100";
            case "READY": return "bg-emerald-50 text-emerald-600 ring-emerald-100";
            case "COMPLETED": return "bg-slate-50 text-slate-500 ring-slate-100";
            case "CANCELLED": return "bg-red-50 text-red-600 ring-red-100";
            default: return "bg-slate-50 text-slate-500 ring-slate-100";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading orders...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center">
            <div className="h-28 md:h-32 w-full flex-shrink-0" />
            <div className="max-w-4xl mx-auto w-full px-6 md:px-12 pb-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight m-0">Your Orders</h1>
                        <p className="text-slate-400 font-bold text-lg mt-2">Track and manage your recent meals</p>
                    </div>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 px-6 h-14">
                        <Search size={18} className="text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="bg-transparent border-none outline-none font-bold text-sm text-slate-600 w-40"
                        />
                    </div>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-xl shadow-slate-200/50"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Receipt size={40} className="text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">No Orders Yet</h2>
                        <p className="text-slate-400 font-bold mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                            Looks like you haven't placed any orders yet. Ready for a feast?
                        </p>
                        <button
                            onClick={() => navigate("/menu")}
                            className="px-10 py-5 bg-orange-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-2xl shadow-orange-600/20 active:scale-95"
                        >
                            Order Now
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                #{order.id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
                                            {order.branch?.name || "Global Kitchen"}
                                        </h3>

                                        <div className="flex flex-wrap gap-6">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                                <Clock size={16} />
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                                                <MapPin size={16} />
                                                {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:items-end justify-between gap-6">
                                        <div className="text-3xl font-black text-slate-950">₹{order.orderTotal}</div>
                                        <button
                                            onClick={() => navigate(`/order/${order.id}`)}
                                            className="bg-slate-950 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-950/20 group-hover:bg-orange-600 group-hover:shadow-orange-600/20"
                                        >
                                            Track Order <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
