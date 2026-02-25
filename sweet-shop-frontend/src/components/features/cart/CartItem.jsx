import React from "react";
import { motion } from "framer-motion";
import { cartStyles as styles } from "./CartStyles";
import { useRemoveCartItem, useUpdateCartItem } from "../../../hooks/useCart";
import { toast } from "react-toastify";

export default function CartItem({ item }) {
    const removeMutation = useRemoveCartItem();
    const updateMutation = useUpdateCartItem();

    const removeItem = (productId, productName) => {
        const loadingToast = toast.loading("Removing item...");
        removeMutation.mutate(productId, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success(`${productName} removed from cart`);
            },
            onError: (err) => {
                console.error(err);
                toast.dismiss(loadingToast);
                toast.error("Failed to remove item.");
            }
        });
    };

    const updateQuantity = (productId, currentQty, change, maxStock) => {
        const newQty = currentQty + change;
        if (newQty < 1) {
            toast.warning("Quantity cannot be less than 1");
            return;
        }
        if (change > 0 && maxStock && newQty > maxStock) {
            toast.error(`Only ${maxStock} items available in stock!`);
            return;
        }

        updateMutation.mutate({ sweetId: productId, quantity: newQty }, {
            onError: (err) => {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to update quantity");
            }
        });
    };

    return (
        <motion.div
            style={styles.cartItem}
        >
            <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.productName || item.sweetName}</h3>
                <div style={styles.itemDetails}>
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Price:</span>
                        <span style={styles.detailValue}>₹{item.price}</span>
                    </div>

                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Quantity:</span>
                        <div style={styles.qtyContainer}>
                            <button
                                style={styles.qtyBtn}
                                onClick={() => updateQuantity(item.productId || item.sweet || item._id, item.selectedQuantity, -1, item.availableQuantity)}
                            >-</button>
                            <span style={styles.qtyValue}>{item.selectedQuantity}</span>
                            <button
                                style={styles.qtyBtn}
                                onClick={() => updateQuantity(item.productId || item.sweet || item._id, item.selectedQuantity, 1, item.availableQuantity)}
                            >+</button>
                        </div>
                    </div>

                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Available:</span>
                        <span style={{
                            ...styles.detailValue,
                            color: (item.availableQuantity || 0) > 0 ? '#28a745' : '#dc3545'
                        }}>
                            {item.availableQuantity || 0}
                        </span>
                    </div>
                </div>

                {(item.availableQuantity || 0) < item.selectedQuantity && (
                    <div style={styles.stockWarning}>
                        Only {item.availableQuantity || 0} units available
                    </div>
                )}

                <div style={styles.itemTotal}>
                    Subtotal: <span style={styles.itemTotalAmount}>₹{item.price * item.selectedQuantity}</span>
                </div>
            </div>

            <motion.button
                onClick={() => removeItem(item.productId || item.sweet || item._id, item.productName || item.sweetName)}
                style={styles.removeButton}
                whileHover={{ scale: 1.05, backgroundColor: "#d32f2f" }}
                whileTap={{ scale: 0.95 }}
            >
                Remove
            </motion.button>
        </motion.div>
    );
}
