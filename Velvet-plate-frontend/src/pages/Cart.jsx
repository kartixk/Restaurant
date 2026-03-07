import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useRemoveCartItem, useUpdateCartItem, useConfirmOrder, useUpdateOrderType } from "../hooks/useCart";
import useCartStore from "../store/useCartStore";
import { X, Minus, Plus, ShoppingBag, ArrowRight, CreditCard, Wallet, Banknote, Utensils, Package, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import useLocationStore from "../store/useLocationStore";

export default function Cart() {
    const { orderType, setOrderType, paymentMethod, setPaymentMethod } = useCartStore();
    const { selectedBranchId } = useLocationStore();
    const { data: cartData, isLoading } = useCart();
    const removeMutation = useRemoveCartItem();
    const updateQuantityMutation = useUpdateCartItem();
    const confirmMutation = useConfirmOrder();
    const orderTypeMutation = useUpdateOrderType();
    const navigate = useNavigate();

    const handleUpdateQuantity = (productId, currentQty, amount) => {
        const newQty = currentQty + amount;
        if (newQty < 1) {
            removeMutation.mutate(productId);
            return;
        }
        updateQuantityMutation.mutate({ productId, quantity: newQty });
    };

    const handleToggleOrderType = (type) => {
        setOrderType(type);
        if (cartData?.items?.length > 0) {
            orderTypeMutation.mutate(type);
        }
    };

    const handlePaymentSelect = (method) => {
        if (method === 'CARD') {
            toast.info("Card payment feature is upcoming soon! 💳", {
                icon: "🚀",
                style: { borderRadius: '16px', fontWeight: 'bold' }
            });
            return;
        }
        setPaymentMethod(method);
    };

    const handleCheckout = () => {
        if (!selectedBranchId) {
            toast.error("Please select a branch first");
            return;
        }
        confirmMutation.mutate({ paymentMethod, branchId: selectedBranchId }, {
            onSuccess: (data) => {
                toast.success("Order placed successfully!");
                navigate(`/order/${data.orderId}`);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Checkout failed");
            }
        });
    };

    const cartItems = cartData?.items || [];
    const subtotal = cartData?.total || 0;
    const sgst = Number((subtotal * 0.09).toFixed(2));
    const cgst = Number((subtotal * 0.09).toFixed(2));
    const grandTotal = Number((subtotal + sgst + cgst).toFixed(2));

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-slate-400 font-bold bg-white">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin mb-4" />
                <p className="animate-pulse tracking-widest text-[10px] uppercase font-black">Refining your selections...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center max-w-md"
                >
                    <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
                        <ShoppingBag size={56} className="text-slate-200" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
                    <p className="text-slate-500 font-medium mb-12">Looks like you haven't added any of our delicious treats to your cart yet.</p>
                    <Link
                        to="/menu"
                        className="px-12 py-5 bg-orange-600 text-white rounded-[2rem] text-sm font-black shadow-2xl shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        Browse Menu <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 bg-slate-50/30">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all hover:border-slate-200"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight m-0">Checkout</h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Review your order details</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Order Items</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{cartItems.length} items</span>
                            </div>

                            <div className="space-y-8">
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.productId}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex flex-col sm:flex-row sm:items-center gap-6 group"
                                        >
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-orange-600 transition-colors">{item.productName}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Unit Price: ₹{item.price}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                    <button
                                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-white rounded-xl transition-all hover:shadow-sm"
                                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-black text-slate-900 text-base min-w-[32px] text-center">{item.quantity}</span>
                                                    <button
                                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-white rounded-xl transition-all hover:shadow-sm"
                                                        onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-right min-w-[100px]">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</div>
                                                    <div className="font-black text-slate-900 text-xl tracking-tight">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calculations & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 sticky top-32">
                            {/* Section: Type */}
                            <div className="mb-10">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 block">1. Selection Type</label>
                                <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <button
                                        className={`flex-1 py-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${orderType === "DINE_IN"
                                            ? "bg-white text-orange-600 shadow-md shadow-slate-200 ring-1 ring-slate-100"
                                            : "text-slate-400 hover:text-slate-600"
                                            }`}
                                        onClick={() => handleToggleOrderType("DINE_IN")}
                                    >
                                        <Utensils size={14} /> Dine In
                                    </button>
                                    <button
                                        className={`flex-1 py-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${orderType === "TAKEAWAY"
                                            ? "bg-white text-orange-600 shadow-md shadow-slate-200 ring-1 ring-slate-100"
                                            : "text-slate-400 hover:text-slate-600"
                                            }`}
                                        onClick={() => handleToggleOrderType("TAKEAWAY")}
                                    >
                                        <Package size={14} /> Takeaway
                                    </button>
                                </div>
                            </div>

                            {/* Section: Payment */}
                            <div className="mb-10">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4 block">2. Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                                    <button
                                        onClick={() => handlePaymentSelect('CASH')}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'CASH'
                                            ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30"
                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'CASH' ? 'bg-white/20' : 'bg-slate-50'}`}>
                                            <Banknote size={18} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">Cash</span>
                                    </button>
                                    <button
                                        onClick={() => handlePaymentSelect('UPI')}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'UPI'
                                            ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30"
                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${paymentMethod === 'UPI' ? 'bg-white/20' : 'bg-slate-50'}`}>
                                            <Wallet size={18} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">UPI / Online</span>
                                    </button>
                                    <button
                                        onClick={() => handlePaymentSelect('CARD')}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border bg-slate-50/50 border-slate-100 text-slate-300 transition-all opacity-50 cursor-not-allowed`}
                                    >
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100">
                                            <CreditCard size={18} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest">Cards (Soon)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section: Summary */}
                            <div className="space-y-4 mb-10 pt-8 border-t border-slate-50">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-lg font-black text-slate-900">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SGST (9%)</span>
                                    <span className="text-sm font-black text-slate-400 tracking-tight">+ ₹{sgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CGST (9%)</span>
                                    <span className="text-sm font-black text-slate-400 tracking-tight">+ ₹{cgst.toFixed(2)}</span>
                                </div>
                                <div className="bg-slate-900 rounded-3xl p-6 mt-6 shadow-xl shadow-slate-900/20">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">Total Due</span>
                                            <span className="text-3xl font-black text-white leading-none tracking-tighter">₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={confirmMutation.isLoading}
                                            className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                        >
                                            {confirmMutation.isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <ArrowRight size={24} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
