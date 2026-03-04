import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useRemoveCartItem, useUpdateCartItem, useConfirmOrder, useUpdateOrderType } from "../hooks/useCart";
import useCartStore from "../store/useCartStore";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CartDrawer() {
    const { isCartOpen, setIsCartOpen, orderType, setOrderType } = useCartStore();
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

    const handleToggleOrderType = () => {
        const newType = orderType === "DINE_IN" ? "TAKEAWAY" : "DINE_IN";
        setOrderType(newType);
        if (cartData?.items?.length > 0) {
            orderTypeMutation.mutate(newType);
        }
    };

    const handleCheckout = () => {
        confirmMutation.mutate(null, {
            onSuccess: (data) => {
                toast.success("Order placed successfully!");
                setIsCartOpen(false);
                navigate(`/order/${data.order.id || data.order._id}`);
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "Checkout failed");
            }
        });
    };

    const cartItems = cartData?.items || [];
    const total = cartData?.total || 0;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                    />
                    <motion.div
                        className="fixed top-0 right-0 w-full max-w-[420px] h-screen bg-white shadow-2xl shadow-slate-900/20 z-[9999] flex flex-col border-l border-slate-100 font-sans"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3 text-slate-900">
                                <ShoppingBag size={24} className="text-orange-600" />
                                <h2 className="m-0 text-xl font-black">Your Order</h2>
                            </div>
                            <button
                                className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-colors"
                                onClick={() => setIsCartOpen(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex p-4 gap-3 bg-slate-50/50 border-b border-slate-100">
                            <button
                                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${orderType === "DINE_IN"
                                        ? "bg-white text-orange-600 shadow-md ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                                onClick={() => orderType !== "DINE_IN" && handleToggleOrderType()}
                            >
                                🍽️ Dine In
                            </button>
                            <button
                                className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${orderType === "TAKEAWAY"
                                        ? "bg-white text-orange-600 shadow-md ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                                onClick={() => orderType !== "TAKEAWAY" && handleToggleOrderType()}
                            >
                                🛍️ Takeaway
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mb-4" />
                                    Updating cart...
                                </div>
                            ) : cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center gap-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                        <ShoppingBag size={40} className="text-slate-200" />
                                    </div>
                                    <p className="font-bold text-slate-500 m-0">Your order is empty</p>
                                    <p className="text-xs max-w-[200px]">Looks like you haven't added anything to your cart yet.</p>
                                    <button
                                        className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-colors"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Browse Menu
                                    </button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.productId || item.sweetId} className="flex items-center gap-4 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="flex-1">
                                            <h4 className="m-0 text-slate-900 font-bold text-base leading-tight">{item.productName}</h4>
                                            <span className="text-slate-400 text-xs font-semibold mt-1 inline-block text-sm">₹{item.price}</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                                            <button
                                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-white rounded-lg transition-all"
                                                onClick={() => handleUpdateQuantity(item.productId || item.sweetId, item.quantity, -1)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-slate-900 text-sm min-w-[24px] text-center">{item.quantity}</span>
                                            <button
                                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-white rounded-lg transition-all"
                                                onClick={() => handleUpdateQuantity(item.productId || item.sweetId, item.quantity, 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="font-black text-slate-900 text-base min-w-[70px] text-right">
                                            ₹{item.totalPrice}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Due</span>
                                    <span className="text-3xl font-black text-slate-900 leading-none">₹{total}</span>
                                </div>
                                <motion.button
                                    className="w-full py-4 bg-orange-600 text-white rounded-2xl text-base font-black shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                                    onClick={handleCheckout}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={confirmMutation.isLoading}
                                >
                                    {confirmMutation.isLoading ? "Ordering..." : "Place Order"}
                                    {!confirmMutation.isLoading && <ArrowRight size={20} />}
                                </motion.button>
                                <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-tighter">
                                    Secure payment processing powered by Velvet Plate
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
