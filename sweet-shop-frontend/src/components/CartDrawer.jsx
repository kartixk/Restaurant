import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, useRemoveCartItem, useUpdateCartItem, useConfirmOrder, useUpdateOrderType } from "../hooks/useCart";
import useCartStore from "../store/useCartStore";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./CartDrawer.css";

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
                        className="cart-drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                    />
                    <motion.div
                        className="cart-drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="cart-header">
                            <div className="cart-title">
                                <ShoppingBag size={24} />
                                <h2>Your Order</h2>
                            </div>
                            <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="order-type-toggle">
                            <button
                                className={`type-btn ${orderType === "DINE_IN" ? "active" : ""}`}
                                onClick={() => orderType !== "DINE_IN" && handleToggleOrderType()}
                            >
                                🍽️ Dine In
                            </button>
                            <button
                                className={`type-btn ${orderType === "TAKEAWAY" ? "active" : ""}`}
                                onClick={() => orderType !== "TAKEAWAY" && handleToggleOrderType()}
                            >
                                🛍️ Takeaway
                            </button>
                        </div>

                        <div className="cart-items">
                            {isLoading ? (
                                <div className="cart-empty">Loading...</div>
                            ) : cartItems.length === 0 ? (
                                <div className="cart-empty">
                                    <ShoppingBag size={48} className="empty-icon" />
                                    <p>Your order is empty</p>
                                    <button className="continue-btn" onClick={() => setIsCartOpen(false)}>Add items</button>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.productId || item.sweetId} className="cart-item">
                                        <div className="item-info">
                                            <h4>{item.productName}</h4>
                                            <span className="item-price">₹{item.price}</span>
                                        </div>
                                        <div className="item-controls">
                                            <button onClick={() => handleUpdateQuantity(item.productId || item.sweetId, item.quantity, -1)}><Minus size={16} /></button>
                                            <span className="qty">{item.quantity}</span>
                                            <button onClick={() => handleUpdateQuantity(item.productId || item.sweetId, item.quantity, 1)}><Plus size={16} /></button>
                                        </div>
                                        <div className="item-total">
                                            ₹{item.totalPrice}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-summary">
                                    <span className="summary-label">Total Due</span>
                                    <span className="summary-total">₹{total}</span>
                                </div>
                                <button className="checkout-btn" onClick={handleCheckout}>
                                    Place Order <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
