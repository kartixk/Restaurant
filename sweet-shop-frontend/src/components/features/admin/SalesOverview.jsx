// src/components/features/admin/SalesOverview.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { adminStyles as styles } from "./AdminStyles";

// Premium Spring Animations
const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
    hover: { backgroundColor: "#1E1E1E", transition: { duration: 0.2 } }
};

export default function SalesOverview({ reportSummary, salesList, reportType, reportLoading, fetchReport, downloadExcel, AnimatedNumber }) {
    const isDayView = reportType === 'day';

    return (
        <motion.div style={styles.glassCard} variants={cardVariants} initial="initial" animate="animate">
            <div style={styles.cardHeader}>
                <div>
                    <h2 style={styles.sectionTitle}>Performance Analytics</h2>
                    <p style={styles.sectionSubtitle}>Real-time QSR metrics</p>
                </div>
                <div style={styles.downloadButton}>{new Date().toLocaleDateString()}</div>
            </div>

            <div style={styles.statsContainer}>
                <motion.div style={styles.statBoxRevenue} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div>
                        <div style={styles.statLabelWhite}>Total Revenue</div>
                        <div style={styles.statValueWhite}>₹<AnimatedNumber value={reportSummary.totalAmount} /></div>
                    </div>
                </motion.div>

                <motion.div style={styles.statBoxOrders} whileHover={{ scale: 1.02, backgroundColor: '#FAFAFA' }}>
                    <div>
                        <div style={styles.statLabelDark}>Total Orders</div>
                        <div style={styles.statValueDark}><AnimatedNumber value={reportSummary.count} /></div>
                    </div>
                </motion.div>
            </div>

            <div style={styles.filterBar}>
                <div style={styles.filterButtons}>
                    {['day', 'week', 'month', 'year', 'all'].map(t => (
                        <motion.button
                            key={t}
                            onClick={() => fetchReport(t)}
                            style={{ ...styles.filterButton, ...(reportType === t ? styles.filterButtonActive : {}) }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t === 'day' ? "Today" : t === 'all' ? "All Time" : t.charAt(0).toUpperCase() + t.slice(1)}
                        </motion.button>
                    ))}
                </div>
                <motion.button onClick={downloadExcel} style={styles.downloadButton} whileTap={{ scale: 0.95 }}>
                    Export CSV
                </motion.button>
            </div>

            <div style={styles.tableCardContent}>
                <table style={styles.tableHeaderOnly}>
                    <thead style={styles.tableHead}>
                        <tr>
                            {!isDayView && <th style={{ ...styles.tableHeader, width: '15%' }}>Date</th>}
                            <th style={{ ...styles.tableHeader, width: isDayView ? '15%' : '12%' }}>Time</th>
                            <th style={{ ...styles.tableHeader, width: '28%' }}>Menu Item</th>
                            <th style={{ ...styles.tableHeader, width: '15%' }}>Restaurant</th>
                            <th style={{ ...styles.tableHeader, width: '10%' }}>Qty</th>
                            <th style={{ ...styles.tableHeader, width: '20%' }}>Total</th>
                        </tr>
                    </thead>
                </table>

                <div style={styles.tableScrollArea}>
                    {reportLoading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#A1A1AA' }}>Syncing data...</div>
                    ) : (
                        <table style={styles.table}>
                            <motion.tbody initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                                <AnimatePresence>
                                    {salesList.length === 0 ? (
                                        <motion.tr><td colSpan={isDayView ? 5 : 6} style={{ padding: '40px', textAlign: 'center', color: '#52525B' }}>No orders yet.</td></motion.tr>
                                    ) : (
                                        salesList.flatMap((s, sIndex) =>
                                            s.items.map((item, iIndex) => {
                                                const dateObj = new Date(s.createdAt || s.date);
                                                return (
                                                    <motion.tr key={`${s.id}-${iIndex}`} style={styles.tableRow} variants={tableRowVariants} whileHover="hover">
                                                        {!isDayView && <td style={{ ...styles.tableCell, width: '15%' }}>{dateObj.toLocaleDateString()}</td>}
                                                        <td style={{ ...styles.tableCell, color: '#A1A1AA', width: isDayView ? '15%' : '12%' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                        <td style={{ ...styles.tableCellBold, width: '28%' }}>{item.productName}</td>
                                                        <td style={{ ...styles.tableCell, width: '15%' }}>{s.branchName || "Main"}</td>
                                                        <td style={{ ...styles.tableCell, width: '10%' }}><span style={styles.qtyBadge}>{item.quantity || item.selectedQuantity}</span></td>
                                                        <td style={{ ...styles.tableCellBold, color: '#10B981', width: '20%' }}>₹{item.totalPrice}</td>
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
