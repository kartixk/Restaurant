
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { Save, Trash2 } from 'lucide-react';

// --- CUSTOM ANIMATED COUNTER ---
function AnimatedNumber({ value }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function Admin() {
  const [sweets, setSweets] = useState([]);
  const [newSweet, setNewSweet] = useState({
    name: "",
    price: "",
    category: "Milk",
    quantity: "",
    imageUrl: ""
  });
  const [stockInputs, setStockInputs] = useState({});
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");

  // --- REPORT STATE ---
  const [reportType, setReportType] = useState("day");
  const [reportSummary, setReportSummary] = useState({ totalAmount: 0, count: 0 });
  const [salesList, setSalesList] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const navigate = useNavigate();

  const categories = [
    "Milk", "Laddu", "Halwa", "Barfi", "Traditional Indian", "Dry Fruits"
  ];

  const handleApiError = (err, defaultMsg) => {
    console.error(err);
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      toast.error("Session expired. Please login again.");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      toast.error(defaultMsg || "An error occurred");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Access Denied: Please login first.");
      navigate("/login");
      return;
    }
    fetchSweets();
    fetchReport("day");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await api.get("/sweets");
      setSweets(res.data);
    } catch (err) {
      handleApiError(err, "Failed to fetch sweets");
    }
  };

  const fetchReport = async (type) => {
    setReportLoading(true);
    setReportType(type);

    try {
      const res = await api.get(`/reports/sales?type=${type}`);
      const data = Array.isArray(res.data) ? (res.data[0] || {}) : res.data;

      setReportSummary({
        totalAmount: data.totalAmount || 0,
        count: data.count || 0
      });
      setSalesList(data.sales || []);

    } catch (err) {
      handleApiError(err, "Failed to load reports");
      setSalesList([]);
      setReportSummary({ totalAmount: 0, count: 0 });
    } finally {
      setReportLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!salesList || salesList.length === 0) {
      toast.warning("No data to download");
      return;
    }

    const isDayView = reportType === 'day';
    const headers = isDayView
      ? ["Time", "Sweet Name", "Quantity", "Total Price"]
      : ["Date", "Time", "Sweet Name", "Quantity", "Total Price"];

    const rows = salesList.map(s => {
      const dateObj = new Date(s.createdAt || s.date);
      const dateStr = dateObj.toLocaleDateString();
      const timeStr = dateObj.toLocaleTimeString();

      const firstItem = s.items?.[0] || {};
      const sweetName = firstItem.sweetName || "Unknown";
      const quantity = firstItem.quantity || 0;
      const safeName = `"${sweetName.replace(/"/g, '""')}"`;

      return isDayView
        ? [timeStr, safeName, quantity, s.orderTotal || s.totalPrice]
        : [dateStr, timeStr, safeName, quantity, s.orderTotal || s.totalPrice];
    });

    const totalQuantity = salesList.reduce((sum, s) => sum + (s.items?.[0]?.quantity || 0), 0);
    const totalAmount = salesList.reduce((sum, s) => sum + (s.orderTotal || s.totalPrice || 0), 0);

    const summaryRows = [
      [],
      isDayView
        ? ["", "TOTAL", totalQuantity, totalAmount]
        : ["", "", "TOTAL", totalQuantity, totalAmount]
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(",")),
      ...summaryRows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Sales_Report_${reportType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel file downloaded successfully!");
  };

  /* STOCK HANDLERS */
  const handleStockInputChange = (id, value) => {
    setStockInputs({ ...stockInputs, [id]: Number(value) });
  };

  const adjustStock = (id, currentVal, amount) => {
    const baseVal = stockInputs[id] !== undefined ? stockInputs[id] : currentVal;
    const newVal = baseVal + amount;
    if (newVal >= 0) {
      setStockInputs({ ...stockInputs, [id]: newVal });
    } else {
      toast.warning("Stock cannot be negative");
    }
  };

  const saveStockUpdate = async (id) => {
    if (stockInputs[id] === undefined) {
      toast.info("No changes to save");
      return;
    }
    try {
      await api.put(`/sweets/${id}`, { quantity: stockInputs[id] });
      toast.success("Stock updated successfully!");
      fetchSweets();
      const newInputs = { ...stockInputs };
      delete newInputs[id];
      setStockInputs(newInputs);
    } catch (err) {
      handleApiError(err, "Stock update failed");
    }
  };

  const handleAddSweet = async (e) => {
    e.preventDefault();
    const formattedName = newSweet.name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const sweetPayload = { ...newSweet, name: formattedName };

    try {
      await api.post("/sweets", sweetPayload);
      toast.success(`"${formattedName}" added successfully!`);
      const defaultCategory = categories.includes(newSweet.category) ? newSweet.category : categories[0];
      setNewSweet({ name: "", price: "", category: defaultCategory, quantity: "", imageUrl: "" });
      fetchSweets();
    } catch (err) {
      handleApiError(err, "Failed to add sweet");
    }
  };

  const handleDeleteSweet = async (id) => {
    if (window.confirm("Delete this sweet permanently?")) {
      try {
        await api.delete(`/sweets/${id}`);
        toast.success("Sweet deleted successfully!");
        fetchSweets();
      }
      catch (err) {
        handleApiError(err, "Delete failed");
      }
    }
  };

  const handleChange = (e) => setNewSweet({ ...newSweet, [e.target.name]: e.target.value });
  const isDayView = reportType === 'day';

  // --- FILTERED INVENTORY LIST ---
  const filteredInventory = sweets
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory = inventoryCategory === "All" || s.category === inventoryCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // --- ANIMATION VARIANTS ---
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 }
    }
  };

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

  // --- STAGGER CONTAINER FOR INVENTORY ---
  const inventoryContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05
      }
    }
  };

  // --- BOTTOM -> UP SMOOTH SPRING VARIANT ---
  const inventoryItemVariants = {
    hidden: {
      opacity: 0,
      y: 30,        // Start from bottom
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

  return (
    <motion.div
      style={styles.container}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Background Blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      {/* HEADER */}
      <div style={styles.header}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, here's what's happening today.</p>
        </motion.div>

        <motion.button
          onClick={() => navigate("/")}
          style={styles.backButton}
          whileHover={{ scale: 1.05, backgroundColor: "#fff", color: "#667eea" }}
          whileTap={{ scale: 0.95 }}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span> Back to Shop
        </motion.button>
      </div>

      {/* SALES REPORTS */}
      <motion.div style={styles.glassCard} variants={cardVariants}>
        <div style={styles.cardHeader}>
          <h2 style={styles.sectionTitle}>Sales Overview</h2>
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
            <div style={styles.statIcon}>📦</div>
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
            Download Excel 📥
          </motion.button>
        </div>

        {/* TABLE WRAPPER */}
        <div style={styles.tableCardContent}>
          <table style={styles.tableHeaderOnly}>
            <thead style={styles.tableHead}>
              <tr>
                {!isDayView && <th style={{ ...styles.tableHeader, width: '15%' }}>Date</th>}
                <th style={{ ...styles.tableHeader, width: isDayView ? '20%' : '15%' }}>Time</th>
                <th style={{ ...styles.tableHeader, width: '30%' }}>Item</th>
                <th style={{ ...styles.tableHeader, width: '15%' }}>Qty</th>
                <th style={{ ...styles.tableHeader, width: '20%' }}>Total</th>
              </tr>
            </thead>
          </table>

          <div style={styles.tableScrollArea}>
            {reportLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading data...</p>
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
                        <td colSpan={isDayView ? 4 : 5} style={styles.emptyCell}>No sales found.</td>
                      </motion.tr>
                    ) : (
                      salesList.flatMap((s, sIndex) =>
                        s.items.map((item, iIndex) => {
                          const dateObj = new Date(s.createdAt || s.date);
                          const uniqueKey = `${s._id}-${item._id}-${iIndex}`;
                          return (
                            <motion.tr
                              key={uniqueKey}
                              style={styles.tableRow}
                              variants={tableRowVariants}
                              whileHover="hover"
                            >
                              {!isDayView && <td style={{ ...styles.tableCell, width: '15%' }}>{dateObj.toLocaleDateString()}</td>}
                              <td style={{ ...styles.tableCellDim, width: isDayView ? '20%' : '15%' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td style={{ ...styles.tableCellBold, width: '30%' }}>{item.sweetName}</td>
                              <td style={{ ...styles.tableCell, width: '15%' }}>
                                <span style={styles.qtyBadge}>{item.quantity}</span>
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

      {/* SPLIT SECTION */}
      <div style={styles.gridSection}>

        {/* ADD FORM */}
        <motion.div style={styles.glassCardSmall} variants={cardVariants}>
          <div style={styles.cardHeader}>
            <h3 style={styles.sectionSubtitle}>✨ Add New Sweet</h3>
          </div>
          <form onSubmit={handleAddSweet} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input name="name" placeholder="e.g. Gulab Jamun" value={newSweet.name} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select name="category" value={newSweet.category} onChange={handleChange} required style={styles.select}>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Price (₹)</label>
              <input type="number" name="price" placeholder="0" value={newSweet.price} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Quantity</label>
              <input type="number" name="quantity" placeholder="0" value={newSweet.quantity} onChange={handleChange} required style={styles.input} />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
              <label style={styles.label}>Image URL</label>
              <input name="imageUrl" placeholder="https://..." value={newSweet.imageUrl} onChange={handleChange} style={styles.input} required />
            </div>
            <motion.button
              type="submit"
              style={styles.addButton}
              whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0, 123, 255, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              Add Sweet to Menu
            </motion.button>
          </form>
        </motion.div>

        {/* INVENTORY LIST */}
        <motion.div style={styles.glassCardSmall} variants={cardVariants}>
          <div style={styles.inventoryHeader}>
            <h3 style={styles.sectionSubtitle}>📦 Inventory</h3>
            <div style={styles.searchWrapper}>
              <input
                type="text"
                placeholder="Search..."
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
            {/* The Wrapper for Stagger Effect */}
            <motion.div
              key={inventoryCategory} // Resets stagger when category changes
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
                    <p>No sweets found.</p>
                  </motion.div>
                ) : (
                  filteredInventory.map(s => (
                    <motion.div
                      key={s._id}
                      layout
                      variants={inventoryItemVariants}
                      // Children of staggered container don't need explicit initial/animate/exit
                      // unless overriding, but AnimatePresence needs exit
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover="hover"
                      style={styles.inventoryItem}
                    >
                      <div style={styles.inventoryInfo}>
                        <div style={styles.sweetName}>{s.name}</div>
                        <span style={styles.catBadge}>{s.category}</span>
                        <div style={s.quantity === 0 ? styles.outOfStock : styles.inStock}>
                          {s.quantity === 0 ? "• Out of Stock" : `• ${s.quantity} units left`}
                        </div>
                      </div>

                      <div style={styles.inventoryControls}>
                        <div style={styles.stepper}>
                          <button onClick={() => adjustStock(s._id, s.quantity, -1)} style={styles.stepBtn}>-</button>
                          <input
                            type="number"
                            value={stockInputs[s._id] !== undefined ? stockInputs[s._id] : s.quantity}
                            onChange={(e) => handleStockInputChange(s._id, e.target.value)}
                            style={styles.stepInput}
                          />
                          <button onClick={() => adjustStock(s._id, s.quantity, 1)} style={styles.stepBtn}>+</button>
                        </div>

                        <motion.button
                          onClick={() => saveStockUpdate(s._id)}
                          style={styles.actionBtnBlue}
                          whileHover={{ scale: 1.1 }}
                          title="Save"
                        >
                          <Save size={18} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteSweet(s._id)}
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

      </div>
    </motion.div>
  );
}

const styles = {
  // --- LAYOUT & BACKGROUND ---
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'rgba(142, 197, 252, 0.4)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    zIndex: 0
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'rgba(224, 195, 252, 0.4)',
    borderRadius: '50%',
    filter: 'blur(100px)',
    zIndex: 0
  },

  // --- HEADER ---
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    position: 'relative',
    zIndex: 1
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#2d3748',
    margin: 0,
    letterSpacing: '-0.5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  subtitle: {
    color: '#4a5568',
    fontSize: '1rem',
    marginTop: '5px'
  },
  backButton: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#4a5568',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },

  // --- GLASS CARDS ---
  glassCard: {
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: '24px',
    padding: '2rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: 1
  },
  glassCardSmall: {
    background: 'rgba(255, 255, 255, 0.65)',
    borderRadius: '24px',
    padding: '1.5rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '650px',
    position: 'relative',
    zIndex: 1
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1a202c', margin: 0 },
  sectionSubtitle: { fontSize: '1.2rem', fontWeight: '700', color: '#2d3748', margin: 0 },
  dateBadge: {
    background: 'rgba(0,0,0,0.05)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4a5568'
  },

  // --- STATS ---
  statsContainer: { display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' },
  statBoxRevenue: {
    flex: 1,
    minWidth: '280px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    padding: '2rem',
    borderRadius: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 10px 20px rgba(17, 153, 142, 0.3)'
  },
  statBoxOrders: {
    flex: 1,
    minWidth: '280px',
    background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
    padding: '2rem',
    borderRadius: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    boxShadow: '0 10px 20px rgba(58, 123, 213, 0.3)'
  },
  statIcon: { fontSize: '3rem', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' },
  statLabelWhite: { fontSize: '0.9rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
  statValueWhite: { fontSize: '2.5rem', fontWeight: '800' },

  // --- FILTERS ---
  filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  filterButtons: { display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '50px' },
  filterButton: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    background: 'transparent',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },
  filterButtonActive: { background: '#fff', color: '#3a7bd5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  downloadButton: {
    padding: '10px 24px',
    background: 'linear-gradient(45deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  },

  // --- TABLE ---
  tableCardContent: {
    background: 'white',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.05)',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  },
  tableHeaderOnly: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  tableScrollArea: {
    maxHeight: '400px',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e1 transparent'
  },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  tableHead: { background: '#f8fafc' },
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: { borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
  tableCell: { padding: '16px', color: '#334155', fontSize: '0.95rem' },
  tableCellDim: { padding: '16px', color: '#94a3b8', fontSize: '0.9rem' },
  tableCellBold: { padding: '16px', fontWeight: '600', color: '#1e293b' },
  tableCellGreen: { padding: '16px', fontWeight: '700', color: '#10b981' },
  qtyBadge: { background: '#edf2f7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
  emptyCell: { padding: '40px', textAlign: 'center', color: '#94a3b8' },

  // --- SPLIT GRID ---
  gridSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },

  // --- FORM ---
  form: { display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', outline: 'none', transition: 'border 0.2s' },
  select: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', outline: 'none' },
  addButton: {
    gridColumn: 'span 2',
    padding: '14px',
    background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    marginTop: '10px',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },

  // --- INVENTORY ---
  inventoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: '1rem'
  },
  searchWrapper: { position: 'relative' },
  searchInput: {
    padding: '8px 32px 8px 12px',
    borderRadius: '20px',
    border: '1px solid #cbd5e1',
    width: '160px',
    fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.8)'
  },
  searchIcon: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', opacity: 0.5 },

  // CATEGORY TABS
  categoryTabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    paddingBottom: '1rem',
    marginBottom: '0.5rem',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  categoryTab: {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  categoryTabActive: {
    background: '#3a7bd5',
    color: '#fff',
    borderColor: '#3a7bd5',
    boxShadow: '0 2px 5px rgba(58, 123, 213, 0.3)'
  },

  inventoryListScroll: { overflowY: 'auto', flex: 1, padding: '4px', scrollbarWidth: 'thin' },
  inventoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    marginBottom: '10px',
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.9)',
    transition: 'all 0.2s'
  },
  inventoryInfo: { flex: 1 },
  sweetName: { fontWeight: '700', color: '#2d3748', fontSize: '1.05rem', marginBottom: '4px' },
  catBadge: { fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#64748b', fontWeight: '600' },
  inStock: { fontSize: '0.85rem', color: '#10b981', fontWeight: '600', marginTop: '4px' },
  outOfStock: { fontSize: '0.85rem', color: '#ef4444', fontWeight: '600', marginTop: '4px' },

  inventoryControls: { display: 'flex', alignItems: 'center', gap: '12px' },
  stepper: { display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px' },
  stepBtn: { width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  stepInput: { width: '30px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: '600', fontSize: '0.9rem' },

  actionBtnBlue: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#ebf8ff', color: '#3182ce', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actionBtnRed: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  loadingContainer: { padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#64748b' },
  spinner: { width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTop: '3px solid #3182ce', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  emptyInventory: { textAlign: 'center', padding: '40px', color: '#a0aec0' }
};