import React from "react";
import { motion } from "framer-motion";
import { cartStyles as styles } from "./CartStyles";
import { useConfirmOrder } from "../../../hooks/useCart";
import useCartStore from "../../../store/useCartStore";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CheckoutSummary() {
    const cart = useCartStore((state) => state.cart);
    const confirmMutation = useConfirmOrder();

    const generatePDF = (currentCart) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Velvet Plate - Order Invoice", 14, 20);
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Status: Paid / Confirmed`, 14, 36);

        // Table
        const tableColumn = ["Item Name", "Price (Rs)", "Qty", "Subtotal (Rs)"];
        const tableRows = [];

        currentCart.items.forEach(item => {
            tableRows.push([
                item.productName || item.sweetName,
                item.price,
                item.selectedQuantity,
                item.price * item.selectedQuantity,
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
        });

        // Total
        const finalY = (doc.lastAutoTable?.finalY || 45) + 10;
        doc.setFontSize(14);
        doc.text(`Grand Total: Rs ${currentCart.total}`, 14, finalY);

        doc.save(`Invoice_${Date.now()}.pdf`);
    };

    const confirmOrder = () => {
        if (!cart || cart.items.length === 0) {
            toast.warning("Your cart is empty!");
            return;
        }

        // Stock Validation
        const outOfStockItems = cart.items.filter(item =>
            (item.availableQuantity || 0) < item.selectedQuantity
        );

        if (outOfStockItems.length > 0) {
            const names = outOfStockItems.map(i => i.productName || i.sweetName).join(', ');
            toast.error(`Insufficient stock for: ${names}`);
            return;
        }

        const loadingToast = toast.loading("Confirming your order...");

        confirmMutation.mutate(undefined, {
            onSuccess: () => {
                toast.dismiss(loadingToast);
                toast.success("Order confirmed successfully! Downloading Invoice... 🎉");
                generatePDF(cart);
            },
            onError: (err) => {
                console.error(err);
                toast.dismiss(loadingToast);
                const errorMsg = err.response?.data?.message || "Failed to confirm order";
                toast.error(errorMsg);
            }
        });
    };

    return (
        <motion.div
            style={styles.summaryWrapper}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div style={styles.summaryCard}>
                <h3 style={styles.summaryTitle}>Order Summary</h3>

                <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Items ({cart.items?.length || 0}):</span>
                    <span style={styles.summaryValue}>₹{cart.total}</span>
                </div>

                <div style={styles.summaryDivider}></div>

                <div style={styles.summaryTotal}>
                    <span style={styles.totalLabel}>Total:</span>
                    <span style={styles.totalValue}>₹{cart.total}</span>
                </div>

                <motion.button
                    onClick={confirmOrder}
                    style={styles.confirmButton}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Confirm Order & Download Bill
                </motion.button>
            </div>
        </motion.div>
    );
}
