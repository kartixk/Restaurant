// src/components/features/cart/CartItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useRemoveFromCart } from '../../../hooks/useCart';
import { cartStyles as styles } from './CartStyles';
import { toast } from 'react-toastify';

export default function CartItem({ item }) {
    const removeMutation = useRemoveFromCart();

    const handleRemove = () => {
        removeMutation.mutate(item.productId || item.sweet || item._id, {
            onSuccess: () => toast.success(`${item.productName} removed from cart`),
            onError: () => toast.error("Failed to remove item")
        });
    };

    return (
        <motion.div
            style={styles.cartItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            layout
        >
            <img
                src={item.imageUrl || "https://placehold.co/100x100?text=No+Image"}
                alt={item.productName}
                style={styles.itemImage}
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=Food"; }}
            />

            <div style={styles.itemInfo}>
                <h4 style={styles.itemName}>{item.productName}</h4>
                <span style={styles.itemPrice}>₹{item.price}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Qty:</span>
                    <span style={{
                        background: '#F1F5F9',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: '#0F172A'
                    }}>
                        {item.quantity || item.selectedQuantity}
                    </span>
                </div>
            </div>

            <motion.button
                style={styles.removeBtn}
                onClick={handleRemove}
                whileHover={{ scale: 1.1, backgroundColor: '#FEE2E2' }}
                whileTap={{ scale: 0.9 }}
                title="Remove Item"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </motion.button>
        </motion.div>
    );
}
