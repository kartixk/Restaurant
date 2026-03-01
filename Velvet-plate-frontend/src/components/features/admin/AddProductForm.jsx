import React from "react";
import { motion } from "framer-motion";
import { adminStyles as styles } from "./AdminStyles";

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
};

export default function AddProductForm({
    handleAddProduct,
    newProduct,
    handleChange,
    categories,
    branches = [],
    role
}) {
    return (
        <motion.div style={styles.glassCardSmall} variants={cardVariants}>
            <div style={styles.cardHeader}>
                <h3 style={styles.sectionSubtitle}>✨ Add Menu Item</h3>
            </div>
            <form onSubmit={handleAddProduct} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Item Name</label>
                    <input
                        name="name"
                        placeholder="e.g. Grilled Chicken"
                        value={newProduct.name}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Category</label>
                    <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleChange}
                        required
                        style={styles.select}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        placeholder="0"
                        value={newProduct.price}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="0"
                        value={newProduct.quantity}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                {role === "ADMIN" && (
                    <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                        <label style={styles.label}>Branch</label>
                        <select
                            name="branchId"
                            value={newProduct.branchId}
                            onChange={handleChange}
                            required
                            style={styles.select}
                        >
                            <option value="">Select Branch...</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.location})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                    <label style={styles.label}>Image URL</label>
                    <input
                        name="imageUrl"
                        placeholder="https://..."
                        value={newProduct.imageUrl}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />
                </div>
                <motion.button
                    type="submit"
                    style={styles.addButton}
                    whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0, 123, 255, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                >
                    Add to Menu
                </motion.button>
            </form>
        </motion.div>
    );
}
