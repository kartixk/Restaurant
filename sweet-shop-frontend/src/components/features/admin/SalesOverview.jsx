import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const tableContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
};

const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    },
    hover: {
        backgroundColor: "rgba(240, 244, 255, 0.9)",
        scale: 1.005,
        y: -2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        transition: { duration: 0.2 }
    }
};

export default function SalesOverview({
    reportSummary,
    salesList,
    reportType,
    reportLoading,
    fetchReport,
    downloadExcel,
    AnimatedNumber
}) {
    const isDayView = reportType === 'day';

    return (
        <motion.div style={styles.glassCard} variants={cardVariants}>
            <div style={styles.cardHeader}>
                <h2 style={styles.sectionTitle}>Performance Analytics</h2>
                <div style={styles.dateBadge}>{new Date().toLocaleDateString()}</div>
            </div>

            <div style={styles.statsContainer}>
                <motion.div
                    style={styles.statBoxRevenue}
                    whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(40, 167, 69, 0.4)" }}
                >
                    <div style={styles.statIcon}>💰</div>
                    <div>
                        <div style={styles.statLabelWhite}>Total Revenue</div>
                        <div style={styles.statValueWhite}>
                            ₹<AnimatedNumber value={reportSummary.totalAmount} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    style={styles.statBoxOrders}
                    whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 123, 255, 0.4)" }}
                >
                    <div style={styles.statIcon}>🍽️</div>
                    <div>
                        <div style={styles.statLabelWhite}>Total Orders</div>
                        <div style={styles.statValueWhite}>
                            <AnimatedNumber value={reportSummary.count} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* FILTERS */}
            <div style={styles.filterBar}>
                <div style={styles.filterButtons}>
                    {['day', 'week', 'month', 'year', 'all'].map(t => (
                        <motion.button
                            key={t}
                            onClick={() => fetchReport(t)}
                            style={{
                                ...styles.filterButton,
                                ...(reportType === t ? styles.filterButtonActive : {})
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t === 'day' ? "Today" : t === 'all' ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
                        </motion.button>
                    ))}
                </div>
                <motion.button
                    onClick={downloadExcel}
                    style={styles.downloadButton}
                    whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                >
                    Export Report 📄
                </motion.button>
            </div>

            {/* TABLE WRAPPER */}
            <div style={styles.tableCardContent}>
                <table style={styles.tableHeaderOnly}>
                    <thead style={styles.tableHead}>
                        <tr>
                            {!isDayView && <th style={{ ...styles.tableHeader, width: '15%' }}>Date</th>}
                            <th style={{ ...styles.tableHeader, width: isDayView ? '15%' : '12%' }}>Time</th>
                            <th style={{ ...styles.tableHeader, width: '28%' }}>Menu Item</th>
                            <th style={{ ...styles.tableHeader, width: '15%' }}>Branch</th>
                            <th style={{ ...styles.tableHeader, width: '10%' }}>Qty</th>
                            <th style={{ ...styles.tableHeader, width: '20%' }}>Total</th>
                        </tr>
                    </thead>
                </table>

                <div style={styles.tableScrollArea}>
                    {reportLoading ? (
                        <div style={styles.loadingContainer}>
                            <div style={styles.spinner}></div>
                            <p>Loading analytics...</p>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <motion.tbody
                                variants={tableContainerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {salesList.length === 0 ? (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                            <td colSpan={isDayView ? 5 : 6} style={styles.emptyCell}>No sales records found.</td>
                                        </motion.tr>
                                    ) : (
                                        salesList.flatMap((s, sIndex) =>
                                            s.items.map((item, iIndex) => {
                                                const dateObj = new Date(s.createdAt || s.date);
                                                const uniqueKey = `${s.id || s._id}-${item.productId || item._id}-${iIndex}`;
                                                return (
                                                    <motion.tr
                                                        key={uniqueKey}
                                                        style={styles.tableRow}
                                                        variants={tableRowVariants}
                                                        whileHover="hover"
                                                    >
                                                        {!isDayView && <td style={{ ...styles.tableCell, width: '15%' }}>{dateObj.toLocaleDateString()}</td>}
                                                        <td style={{ ...styles.tableCellDim, width: isDayView ? '15%' : '12%' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                        <td style={{ ...styles.tableCellBold, width: '28%' }}>{item.productName || item.sweetName}</td>
                                                        <td style={{ ...styles.tableCell, width: '15%', fontSize: '0.85rem' }}>
                                                            {s.branchName || "Main"}
                                                        </td>
                                                        <td style={{ ...styles.tableCell, width: '10%' }}>
                                                            <span style={styles.qtyBadge}>{item.quantity || item.selectedQuantity}</span>
                                                        </td>
                                                        <td style={{ ...styles.tableCellGreen, width: '20%' }}>₹{item.totalPrice}</td>
                                                    </motion.tr>
                                                );
                                            })
                                        )
                                    )}
                                </AnimatePresence>
                            </motion.tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
