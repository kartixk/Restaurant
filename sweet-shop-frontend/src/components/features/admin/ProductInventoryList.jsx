import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminStyles as styles } from "./AdminStyles";
import { Save, Trash2 } from 'lucide-react';

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
};

const inventoryContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05
        }
    }
};

const inventoryItemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.98
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 18,
            mass: 0.6
        }
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    },
    hover: {
        scale: 1.02,
        y: -2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        zIndex: 10,
        transition: { duration: 0.2 }
    }
};

export default function ProductInventoryList({
    categories,
    inventoryCategory,
    setInventoryCategory,
    inventorySearch,
    setInventorySearch,
    filteredInventory,
    stockInputs,
    handleStockInputChange,
    adjustStock,
    saveStockUpdate,
    handleDeleteProduct
}) {
    return (
        <motion.div style={styles.glassCardSmall} variants={cardVariants}>
            <div style={styles.inventoryHeader}>
                <h3 style={styles.sectionSubtitle}>📦 Menu Inventory</h3>
                <div style={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        style={styles.searchInput}
                    />
                    <span style={styles.searchIcon}>🔍</span>
                </div>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div style={styles.categoryTabsContainer}>
                {["All", ...categories].map((cat) => (
                    <motion.button
                        key={cat}
                        onClick={() => setInventoryCategory(cat)}
                        style={{
                            ...styles.categoryTab,
                            ...(inventoryCategory === cat ? styles.categoryTabActive : {})
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            <div style={styles.inventoryListScroll}>
                <motion.div
                    key={inventoryCategory}
                    variants={inventoryContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredInventory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                style={styles.emptyInventory}
                            >
                                <p>No items found.</p>
                            </motion.div>
                        ) : (
                            filteredInventory.map((s) => (
                                <motion.div
                                    key={s.id || s._id}
                                    layout
                                    variants={inventoryItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover="hover"
                                    style={styles.inventoryItem}
                                >
                                    <div style={styles.inventoryInfo}>
                                        <div style={styles.itemName}>{s.name}</div>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            <span style={styles.catBadge}>{s.category}</span>
                                            {s.branchName && (
                                                <span style={{ ...styles.catBadge, background: '#fef3c7', color: '#92400e' }}>
                                                    📍 {s.branchName}
                                                </span>
                                            )}
                                        </div>
                                        <div style={s.quantity === 0 ? styles.outOfStock : styles.inStock}>
                                            {s.quantity === 0 ? "• Sold Out" : `• ${s.quantity} available`}
                                        </div>
                                    </div>

                                    <div style={styles.inventoryControls}>
                                        <div style={styles.stepper}>
                                            <button onClick={() => adjustStock(s.id || s._id, s.quantity, -1)} style={styles.stepBtn}>-</button>
                                            <input
                                                type="number"
                                                value={stockInputs[s.id || s._id] !== undefined ? stockInputs[s.id || s._id] : s.quantity}
                                                onChange={(e) => handleStockInputChange(s.id || s._id, e.target.value)}
                                                style={styles.stepInput}
                                            />
                                            <button onClick={() => adjustStock(s.id || s._id, s.quantity, 1)} style={styles.stepBtn}>+</button>
                                        </div>

                                        <motion.button
                                            onClick={() => saveStockUpdate(s.id || s._id)}
                                            style={styles.actionBtnBlue}
                                            whileHover={{ scale: 1.1 }}
                                            title="Save"
                                        >
                                            <Save size={18} />
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDeleteProduct(s.id || s._id)}
                                            style={styles.actionBtnRed}
                                            whileHover={{ scale: 1.1 }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
