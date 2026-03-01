import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axios";
import { useProducts, useAddProduct, useDeleteProduct, useUpdateProductStock } from "../hooks/useProducts";
import { useBranches } from "../hooks/useBranches";
import useAuthStore from "../store/useAuthStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

import AddProductForm from "../components/features/admin/AddProductForm";
import ProductInventoryList from "../components/features/admin/ProductInventoryList";
import BranchSettingsModal from "../components/features/admin/BranchSettingsModal";

// ─── FORMATTERS ─────────────────────────────────────────────────────────────
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(value);
};

// ─── ICONS (Minimal SaaS UI) ────────────────────────────────────────────────
const Icons = {
  Dashboard: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Branches: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Analytics: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Users: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Phone: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14z" /></svg>,
  Logout: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Menu: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  User: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Bell: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Check: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, isPositive, styles }) {
  const S = styles;
  return (
    <div style={S.statCard}>
      <div style={S.statHeader}>
        <span style={S.statLabel}>{label}</span>
      </div>
      <div style={S.statValue}>{value}</div>
      {trend && (
        <div style={{ ...S.trendBadge, color: isPositive ? "#059669" : "#dc2626", backgroundColor: isPositive ? "#ecfdf5" : "#fef2f2" }}>
          {isPositive ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusStyles = {
    active: { bg: "#ecfdf5", color: "#047857", border: "1px solid #10b98133" },
    inactive: { bg: "#f8fafc", color: "#64748b", border: "1px solid #cbd5e1" },
    pending: { bg: "#fffbeb", color: "#b45309", border: "1px solid #f59e0b33" }
  };
  const s = statusStyles[status?.toLowerCase()] || statusStyles.inactive;
  return (
    <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: s.bg, color: s.color, border: s.border, textTransform: "capitalize" }}>
      {status || 'Unknown'}
    </span>
  );
}


// ─── MAIN ADMIN COMPONENT ───────────────────────────────────────────────────
export default function Admin() {
  const { role: upperRole, isAuthenticated, user, logout } = useAuthStore();
  const role = upperRole ? upperRole.toUpperCase() : null;
  const navigate = useNavigate();

  if (role === "MANAGER") {
    return <Navigate to="/manager" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [activeBranchTab, setActiveBranchTab] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("adminDarkMode") === "true");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const S = useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  // Close notification dropdown when clicking outside
  const notificationsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Data
  const { data: dbBranches = [], refetch: refetchBranches } = useBranches();
  const pendingStores = useMemo(() => dbBranches.filter(b => b.storeStatus === "under_review"), [dbBranches]);
  const { data: products = [], error: productsError } = useProducts(selectedBranchId);

  // Forms & State
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "Main Course", quantity: "", imageUrl: "", branchId: "" });
  const [stockInputs, setStockInputs] = useState({});
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");

  // Reports State
  const [reportSummary, setReportSummary] = useState({ totalAmount: 0, count: 0 });
  const [salesList, setSalesList] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Mutations
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateStockMutation = useUpdateProductStock();

  const categories = ["Appetizers", "Main Course", "Desserts", "Beverages", "Sides", "Specials"];

  useEffect(() => {
    if (!isAuthenticated || (role !== "ADMIN" && role !== "MANAGER")) {
      toast.error("Access Denied.");
      navigate("/login");
    } else if (role === "MANAGER") {
      navigate("/manager");
    } else {
      fetchReport("month"); // default to month for dashboard charts
    }
  }, [isAuthenticated, role, navigate, selectedBranchId, activeSidebarItem]);

  const handleApproveStore = async (branchId) => {
    try {
      await api.put(`/branches/${branchId}/verify`, { status: "verified" });
      toast.success("Store Approved! Verification email sent to manager.");
      if (refetchBranches) refetchBranches();
    } catch (err) {
      handleApiError(err, "Failed to approve store");
    }
  };

  const handleRejectStore = async (branchId) => {
    try {
      await api.put(`/branches/${branchId}/verify`, { status: "rejected" });
      toast.success("Store rejected. Notification email sent to manager.");
      if (refetchBranches) refetchBranches();
    } catch (err) {
      handleApiError(err, "Failed to reject store");
    }
  };

  const handleApiError = (err, msg) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      toast.error("Session expired."); setTimeout(() => navigate("/login"), 2000);
    } else toast.error(msg || "An error occurred");
  };

  const fetchReport = async (type) => {
    setReportLoading(true);
    try {
      const endpoint = role === "ADMIN" ? "/reports/sales" : "/reports/branch-sales";
      const res = await api.get(`${endpoint}?type=${type}${selectedBranchId ? `&branchId=${selectedBranchId}` : ""}`);
      const data = Array.isArray(res.data) ? (res.data[0] || {}) : res.data;
      setReportSummary({ totalAmount: data.totalAmount || 0, count: data.count || 0 });
      setSalesList(data.sales || []);
    } catch (err) {
      handleApiError(err, "Failed to load reports");
      setSalesList([]); setReportSummary({ totalAmount: 0, count: 0 });
    } finally { setReportLoading(false); }
  };

  // Map real branches from DB with real revenue
  const displayBranches = dbBranches.map(b => {
    // Sum revenue for this branch from salesList using orderTotal
    const branchRevenue = salesList
      .filter(s => s.branchId === b.id)
      .reduce((sum, s) => sum + (Number(s.orderTotal) || 0), 0);

    return {
      id: b.id, name: b.name, location: b.location,
      managerName: b.manager?.name, managerEmail: b.manager?.email, managerPhone: b.manager?.phone || "+91 9999999999",
      status: b.storeStatus?.toLowerCase() === 'verified' ? (b.isVisible ? 'active' : 'paused') : 'inactive',
      revenue: branchRevenue,
      isVisible: b.isVisible
    };
  });

  const activeBranchesCount = displayBranches.filter(b => b.status === 'active' || b.status === 'paused').length;

  // Chart Data Preparation (using real sales list or falling back to empty shape)
  const revenueChartData = useMemo(() => {
    if (salesList.length === 0) return Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, revenue: 0 }));
    // Simple group by date (assuming short lists, normally backend groups this)
    const grouped = {};
    salesList.forEach(s => {
      const d = new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      grouped[d] = (grouped[d] || 0) + (Number(s.orderTotal) || 0);
    });
    return Object.keys(grouped).slice(-30).map(k => ({ date: k, revenue: grouped[k] }));
  }, [salesList]);

  const pieData = [
    { name: 'Dine-in', value: 45, color: S.pageTitle.color },
    { name: 'Takeaway', value: 20, color: S.pageSubtitle.color },
  ];

  // Logic handlers
  const handleStockInputChange = (id, v) => setStockInputs({ ...stockInputs, [id]: Number(v) });
  const adjustStock = (id, cur, amt) => {
    const base = stockInputs[id] !== undefined ? stockInputs[id] : cur;
    const nv = base + amt;
    if (nv >= 0) setStockInputs({ ...stockInputs, [id]: nv });
    else toast.warning("Stock cannot be negative");
  };
  const saveStockUpdate = (id) => {
    if (stockInputs[id] === undefined) { toast.info("No changes"); return; }
    updateStockMutation.mutate({ id, quantity: stockInputs[id] }, {
      onSuccess: () => { toast.success("Stock updated!"); const n = { ...stockInputs }; delete n[id]; setStockInputs(n); },
      onError: (err) => handleApiError(err, "Stock update failed")
    });
  };
  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = newProduct.name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    addProductMutation.mutate({ ...newProduct, name, branchId: selectedBranchId }, {
      onSuccess: () => { toast.success(`"${name}" added!`); setNewProduct({ name: "", price: "", category: "Main Course", quantity: "", imageUrl: "", branchId: "" }); },
      onError: (err) => handleApiError(err, "Failed to add product")
    });
  };
  const handleDeleteProduct = (id) => {
    if (window.confirm("Delete this item?")) deleteProductMutation.mutate(id, {
      onSuccess: () => toast.success("Deleted!"),
      onError: (err) => handleApiError(err, "Delete failed")
    });
  };
  const filteredInventory = products.filter(s => s.name.toLowerCase().includes(inventorySearch.toLowerCase()) && (inventoryCategory === "All" || s.category === inventoryCategory)).sort((a, b) => a.name.localeCompare(b.name));

  // ─── RENDERERS ─────────────────────────────────────────────────────────────

  const renderDashboardGlobal = () => (
    <div style={S.mainContent}>
      <div style={S.headerRow}>
        <div>
          <h1 style={S.pageTitle}>Dashboard overview</h1>
          <p style={S.pageSubtitle}>System-wide aggregate performance metrics.</p>
        </div>
      </div>

      <div style={S.statsGrid}>
        <StatCard styles={S} label="Total Revenue" value={formatCurrency(reportSummary.totalAmount)} />
        <StatCard styles={S} label="Active Branches" value={activeBranchesCount} />
        <StatCard styles={S} label="Total Orders" value={reportSummary.count} />
        <StatCard styles={S} label="Avg. Order Value" value={reportSummary.count > 0 ? formatCurrency(reportSummary.totalAmount / reportSummary.count) : formatCurrency(0)} />
      </div>

      <div style={S.chartGrid}>
        <div style={{ ...S.card, gridColumn: "span 2" }}>
          <div style={S.cardHeader}><h2 style={S.cardTitle}>Revenue Last 30 Days</h2></div>
          <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
            <div style={{ height: 300, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: S.pageSubtitle.color, fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: S.pageSubtitle.color, fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke={S.pageTitle.color} strokeWidth={3} dot={false} activeDot={{ r: 6, fill: S.pageTitle.color, stroke: isDarkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}><h2 style={S.cardTitle}>Top Branches</h2></div>
          <div style={{ padding: "1rem" }}>
            {displayBranches.length === 0 ? (
              <div style={S.emptyState}>No branches to rank</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {displayBranches
                  .filter(b => b.status === 'active' || b.status === 'paused')
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: i === 0 ? '#fef3c7' : '#f1f5f9', color: i === 0 ? '#b45309' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                          {i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: S.pageTitle.color, fontSize: '0.875rem' }}>{b.name}</div>
                          <div style={{ color: S.pageSubtitle.color, fontSize: '0.75rem' }}>{b.location}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: S.pageTitle.color, fontSize: '0.875rem' }}>{formatCurrency(b.revenue)}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── 1. RESTAURANT FLEET DASHBOARD (List View) ─────────────────────────────
  const renderBranchesList = () => {
    // Role-Based Filtering: Admins see all, Managers see only their assigned branches
    // Additionally filter to only show 'active' (verified) branches in the main list
    const authorizedBranches = (role === "ADMIN"
      ? displayBranches
      : displayBranches.filter(b => b.managerEmail === user?.email)
    ).filter(b => b.status === 'active' || b.status === 'paused');

    return (
      <div style={S.mainContent}>
        <div style={S.headerRow}>
          <div>
            <h1 style={S.pageTitle}>{role === "ADMIN" ? "Restaurant Fleet" : "My Restaurant"}</h1>
            <p style={S.pageSubtitle}>
              {role === "ADMIN" ? "Monitor live status and revenue across all locations." : "Manage your specific location's performance and menu."}
            </p>
          </div>
          {/* The "+ Onboard New Store" button has been completely removed as requested */}
        </div>

        {authorizedBranches.length === 0 ? (
          <div style={S.emptyState}>
            <Icons.Branches />
            <h3>No Restaurants Assigned</h3>
            <p>You currently do not have any active stores under your control.</p>
          </div>
        ) : (
          <div style={S.storeGrid}>
            {authorizedBranches.map(branch => (
              <motion.div
                key={branch.id}
                style={S.storeCard}
                whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div style={S.storeCardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={S.storeIcon}>🍔</div>
                    <div>
                      <h3 style={S.storeName}>{branch.name}</h3>
                      <p style={S.storeLocation}>{branch.location}</p>
                    </div>
                  </div>
                  <div style={branch.status === 'active' ? S.statusBadgeLive : (branch.status === 'paused' ? { ...S.statusBadgeOffline, color: '#94a3b8', backgroundColor: '#f1f5f9' } : S.statusBadgeOffline)}>
                    <span style={{ ...S.statusDot, backgroundColor: branch.status === 'active' ? '#10b981' : '#94a3b8' }}></span>
                    {branch.status === 'active' ? 'Accepting Orders' : (branch.status === 'paused' ? 'Inactive' : 'Offline')}
                  </div>
                </div>

                <div style={S.storeMetrics}>
                  <div style={S.metricBox}>
                    <span style={S.metricLabel}>Today's Rev</span>
                    <span style={S.metricValue}>{formatCurrency(branch.revenue || 0)}</span>
                  </div>
                  <div style={S.metricBox}>
                    <span style={S.metricLabel}>Manager</span>
                    <span style={{ ...S.metricValue, fontSize: '0.9rem', color: '#475569' }}>
                      {branch.managerName ? branch.managerName.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div style={S.storeActions}>
                  <button
                    onClick={() => setSelectedBranchId(branch.id)}
                    style={S.actionBtnBlue}
                  >
                    Enter Command Center →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─── 2. STORE COMMAND CENTER (Detail View) ─────────────────────────────────
  const renderBranchDetail = () => {
    const branch = displayBranches.find(b => b.id === selectedBranchId);
    if (!branch) return null;

    return (
      <div style={S.mainContent}>
        <button onClick={() => setSelectedBranchId("")} style={S.linkBtn}>← Back to Fleet Dashboard</button>

        <div style={S.commandHeader}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={S.commandIcon}>🏢</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '4px' }}>
                <h1 style={S.pageTitle}>{branch.name}</h1>
                <div style={branch.status === 'active' ? S.statusBadgeLive : (branch.status === 'paused' ? { ...S.statusBadgeOffline, color: '#94a3b8', backgroundColor: '#f1f5f9' } : S.statusBadgeOffline)}>
                  <span style={{ ...S.statusDot, backgroundColor: branch.status === 'active' ? '#10b981' : '#94a3b8' }}></span>
                  {branch.status === 'active' ? 'Live' : (branch.status === 'paused' ? 'Inactive' : 'Offline')}
                </div>
              </div>
              <p style={{ ...S.pageSubtitle, display: 'flex', gap: '1.5rem' }}>
                <span>📍 {branch.location}</span>
                <span>📋 MGR: {branch.managerName || 'Pending Assignment'}</span>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
              onClick={() => setIsSettingsModalOpen(true)}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
            >
              <Icons.Settings />
              Store Settings
            </button>
          </div>
        </div>

        <div style={S.tabs}>
          {[["overview", "Live Performance"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveBranchTab(key)} style={{ ...S.tabBtn, ...(activeBranchTab === key ? S.tabBtnActive : {}) }}>{label}</button>
          ))}
        </div>

        {activeBranchTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Real-time KPIs */}
            <div style={S.statsGrid}>
              <StatCard styles={S} label="Revenue (MTD)" value={formatCurrency(reportSummary.totalAmount)} trend="+12.4%" isPositive={true} />
              <StatCard styles={S} label="Total Orders" value={reportSummary.count} trend="Stable" isPositive={true} />
              <StatCard styles={S} label="Avg. Ticket Size" value={formatCurrency(reportSummary.totalAmount / (reportSummary.count || 1))} />
            </div>

            {/* Manager Details Card */}
            <div style={{ ...S.card, padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={S.cardTitle}>Assigned Leadership</h3>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {branch.managerName ? (
                  <>
                    <div style={S.avatarBtnLg}><Icons.User /></div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.1rem' }}>{branch.managerName}</div>
                      <div style={{ color: '#64748B', fontSize: '0.9rem', display: 'flex', gap: '1rem', marginTop: '4px' }}>
                        <span>✉️ {branch.managerEmail}</span>
                        <span>📞 {branch.managerPhone}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#64748B' }}>No manager currently assigned to this location.</p>
                )}
              </div>
            </div>

            {/* Charts Area */}
            <div style={S.chartGrid}>
              <div style={{ ...S.card, gridColumn: "span 2" }}>
                <div style={S.cardHeader}><h2 style={S.cardTitle}>30-Day Order Volume</h2></div>
                <div style={{ height: 300, padding: "1.5rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dx={-10} />
                      <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                      <Bar dataKey="revenue" fill="#FF5A00" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardHeader}><h2 style={S.cardTitle}>Dine-in vs Takeaway</h2></div>
                <div style={{ height: 300, padding: "1rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#1e293b' : '#f59e0b'} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} formatter={(val) => `${val}%`} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem', color: '#64748B', marginTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <BranchSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          branch={dbBranches.find(b => b.id === selectedBranchId)}
        />
      </div>
    );
  };

  // ─── 3. FINANCIAL ANALYTICS & P&L (Reports View) ───────────────────────────
  const renderAnalytics = () => {
    // 1. Process Sales Data for Item Rankings
    const productSalesMap = {};
    salesList.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSalesMap[item.productName]) {
          productSalesMap[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSalesMap[item.productName].qty += item.quantity;
        productSalesMap[item.productName].revenue += item.totalPrice;
      });
    });

    const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // 2. Calculate P&L Financials (Standard QSR Model)
    // Assuming reportSummary.totalAmount is the base Net Sales
    const netSales = reportSummary.totalAmount || 0;

    // QSR standard GST in India is 5%
    const gstCollected = netSales * 0.05;
    const grossRevenue = netSales + gstCollected;

    // Standard QSR Cost Estimates
    const estimatedCogs = netSales * 0.35; // 35% Food Cost
    const operatingExpenses = netSales * 0.25; // 25% Labor, Rent, Utilities

    const netProfit = netSales - estimatedCogs - operatingExpenses;
    const profitMargin = netSales > 0 ? ((netProfit / netSales) * 100).toFixed(1) : 0;

    // Data for P&L Donut Chart
    const pnlChartData = [
      { name: 'Food Cost', value: estimatedCogs, fill: '#EF4444' },     // Red
      { name: 'OpEx', value: operatingExpenses, fill: '#F59E0B' },       // Amber
      { name: 'Net Profit', value: netProfit > 0 ? netProfit : 0, fill: '#10B981' } // Green
    ];

    return (
      <div style={S.mainContent}>
        <div style={S.headerRow}>
          <div>
            <h1 style={S.pageTitle}>Financial Reports</h1>
            <p style={S.pageSubtitle}>Profit & Loss, Tax liabilities, and item performance.</p>
          </div>
          <button style={S.downloadButton} onClick={() => toast.success("Exporting P&L Statement...")}>
            📥 Export Tax Report (CSV)
          </button>
        </div>

        {/* TOP LEVEL KPIs */}
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statHeader}><span style={S.statLabel}>Gross Revenue (Incl GST)</span></div>
            <div style={S.statValue}>{formatCurrency(grossRevenue)}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statHeader}>
              <span style={S.statLabel}>GST Liability (5%)</span>
              <span style={{ fontSize: '0.7rem', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#64748B' }}>TAX</span>
            </div>
            <div style={{ ...S.statValue, color: '#64748B' }}>{formatCurrency(gstCollected)}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statHeader}><span style={S.statLabel}>Net Sales</span></div>
            <div style={S.statValue}>{formatCurrency(netSales)}</div>
          </div>
          <div style={{ ...S.statCard, border: '1px solid #10B981', background: '#F0FDF4', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.1)' }}>
            <div style={S.statHeader}><span style={{ ...S.statLabel, color: '#16A34A' }}>Est. Net Profit</span></div>
            <div style={{ ...S.statValue, color: '#16A34A' }}>{formatCurrency(netProfit)}</div>
            <div style={{ fontSize: '0.85rem', color: '#16A34A', fontWeight: 800, marginTop: '4px' }}>{profitMargin}% Margin</div>
          </div>
        </div>

        <div style={S.chartGrid}>

          {/* PROFIT & LOSS BREAKDOWN */}
          <div style={{ ...S.card, gridColumn: "span 2" }}>
            <div style={S.cardHeader}><h2 style={S.cardTitle}>Profit & Loss Statement (Estimated)</h2></div>
            <div style={{ padding: "1.5rem", display: "flex", gap: "2rem", alignItems: "center" }}>

              {/* Donut Chart */}
              <div style={{ width: "220px", height: "220px", flexShrink: 0 }}>
                {netSales > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pnlChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4} dataKey="value">
                        {pnlChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '12px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>No Data</div>
                )}
              </div>

              {/* P&L Ledger */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontWeight: 600, fontSize: '0.95rem' }}>Net Sales (Base Revenue)</span>
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>{formatCurrency(netSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E2E8F0' }}>
                  <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.95rem' }}>(-) Food Cost (Est. 35%)</span>
                  <span style={{ fontWeight: 700, color: '#EF4444' }}>{formatCurrency(estimatedCogs)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '2px solid #E2E8F0' }}>
                  <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.95rem' }}>(-) Operating Expenses (Est. 25%)</span>
                  <span style={{ fontWeight: 700, color: '#F59E0B' }}>{formatCurrency(operatingExpenses)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                  <span style={{ color: '#10B981', fontWeight: 800, fontSize: '1.2rem' }}>Net Profit</span>
                  <span style={{ fontWeight: 800, color: '#10B981', fontSize: '1.2rem' }}>{formatCurrency(netProfit)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* MENU PERFORMANCE */}
          <div style={S.card}>
            <div style={S.cardHeader}><h2 style={S.cardTitle}>Top Selling Items</h2></div>
            <div style={{ padding: "1.5rem" }}>
              {topSellingProducts.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748B", padding: "2rem 0", fontWeight: 500 }}>No sales data recorded.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {topSellingProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '8px',
                          backgroundColor: i === 0 ? '#FFF7F5' : '#F8FAFC',
                          color: i === 0 ? '#FF5A00' : '#64748B',
                          border: `1px solid ${i === 0 ? '#FFD8CC' : '#E2E8F0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800
                        }}>
                          #{i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem', marginBottom: '2px' }}>{p.name}</div>
                          <div style={{ color: '#64748B', fontSize: '0.80rem', fontWeight: 500 }}>{p.qty} units sold</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{formatCurrency(p.revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ADMIN EXCLUSIVE: BRANCH RANKINGS */}
        {role === "ADMIN" && (
          <div style={{ ...S.card, marginTop: '2rem' }}>
            <div style={S.cardHeader}><h2 style={S.cardTitle}>Fleet Performance Leaderboard</h2></div>
            <div style={{ padding: "1.5rem" }}>
              {displayBranches.length === 0 ? (
                <div style={{ color: '#64748B' }}>No branches available.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {[...displayBranches].sort((a, b) => b.revenue - a.revenue).map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px', backgroundColor: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: i === 0 ? '#FEF3C7' : '#FFFFFF', color: i === 0 ? '#D97706' : '#64748B', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                          {i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>{b.name}</div>
                          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>{b.location}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1rem' }}>{formatCurrency(b.revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    );
  };

  // ─── SETTINGS COMPONENT ────────────────────────────────────────────────────
  const renderSettings = () => (
    <div style={S.mainContent}>
      <div style={S.headerRow}>
        <div>
          <h1 style={S.pageTitle}>System Settings</h1>
          <p style={S.pageSubtitle}>Manage your profile, preferences, and system configurations.</p>
        </div>
      </div>

      <div style={{ ...S.card, padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: S.pageTitle.color, borderBottom: S.cardHeader.borderBottom, paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            Personal Profile
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', color: '#fff', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <Icons.User />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                <span style={{ color: S.pageSubtitle.color, fontSize: '0.875rem' }}>Full Name</span>
                <span style={{ fontWeight: 500, color: S.pageTitle.color }}>{user?.name || "N/A"}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                <span style={{ color: S.pageSubtitle.color, fontSize: '0.875rem' }}>Email Address</span>
                <span style={{ fontWeight: 500, color: S.pageTitle.color }}>{user?.email || "N/A"}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                <span style={{ color: S.pageSubtitle.color, fontSize: '0.875rem' }}>Account Role</span>
                <span style={S.userRoleBadge}>{role}</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );


  // ─── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div style={S.layout}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* SIDEBAR SIDE (FULL HEIGHT) */}
      <div style={{ ...S.sidebar, width: isSidebarCollapsed ? "80px" : "240px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Logo Header inside Sidebar */}
          <div style={{ ...S.sidebarHeader, padding: isSidebarCollapsed ? "0" : "0 20px", justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}>
            <div style={S.logoIcon}>V</div>
            {!isSidebarCollapsed && <span style={S.logoText}>Velvet Plate</span>}
          </div>

          <nav style={S.sidebarNav}>
            {[
              { id: "Dashboard", icon: <Icons.Dashboard /> },
              { id: "Branches", icon: <Icons.Branches /> },
              { id: "Analytics", icon: <Icons.Analytics /> },
              { id: "Settings", icon: <Icons.Settings /> }
            ].map(item => (
              <div
                key={item.id}
                title={item.id}
                onClick={() => { setActiveSidebarItem(item.id); setSelectedBranchId(""); }}
                style={{ ...S.sidebarNavItem, ...(activeSidebarItem === item.id && !selectedBranchId ? S.sidebarNavItemActive : {}), justifyContent: isSidebarCollapsed ? "center" : "flex-start", padding: isSidebarCollapsed ? "12px" : "10px 16px" }}
              >
                <div style={{ ...S.sidebarIcon, color: activeSidebarItem === item.id && !selectedBranchId ? "#0f172a" : "#64748b" }}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span style={{ whiteSpace: "nowrap" }}>{item.id}</span>}
              </div>
            ))}
          </nav>

          {/* Bottom Collapse Button */}
          <div style={{ marginTop: "auto", padding: isSidebarCollapsed ? "16px 8px" : "16px" }}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "10px", borderRadius: "8px", border: "none",
                backgroundColor: S.sidebarNavItemActive.backgroundColor, color: S.pageSubtitle.color, fontSize: "0.875rem",
                fontWeight: 500, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={isSidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
              {!isSidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (TOPBAR + CONTENT) */}
      <div style={S.bodyWrapper}>

        {/* NEW NARROW TOPBAR */}
        <header style={{ ...S.topbar, position: "relative" }}>
          <div style={S.topbarLeft}></div>

          {/* PERFECTLY CENTERED TITLE */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontWeight: 600, color: S.pageTitle.color, fontSize: "1.1rem" }}>
            Admin Console
          </div>

          <div style={S.topbarRight}>

            {/* PENDING REQUESTS BUTTON → links to dedicated page */}
            {role === "ADMIN" && (
              <div style={{ marginRight: "1rem" }}>
                <button
                  onClick={() => navigate("/admin/pending-requests")}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '0.875rem',
                    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <Icons.Users />
                  Pending Requests
                  {pendingStores.length > 0 && (
                    <span style={{
                      backgroundColor: '#FF5A00', color: '#FFFFFF', fontSize: '0.75rem',
                      fontWeight: 800, padding: '2px 8px', borderRadius: '100px',
                      marginLeft: '4px'
                    }}>
                      {pendingStores.length}
                    </span>
                  )}
                </button>
              </div>
            )}


            <div style={{ position: "relative" }}>
              <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} style={S.avatarBtn}>
                <Icons.User />
              </button>
              {isProfileDropdownOpen && (
                <div style={S.dropdownMenu}>
                  <div style={S.dropdownHeader}>
                    <div style={S.userName}>{user?.name || "User"}</div>
                    <div style={S.userEmail}>{user?.email || ""}</div>
                    <div style={S.userRoleBadge}>{role}</div>
                  </div>
                  <div style={S.dropdownDivider}></div>
                  <button onClick={handleLogout} style={S.dropdownItemLogout}>
                    <Icons.Logout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN WORKING AREA */}
        <div style={S.mainArea}>
          {selectedBranchId ? renderBranchDetail() : (
            activeSidebarItem === "Dashboard" ? renderDashboardGlobal() :
              activeSidebarItem === "Branches" ? renderBranchesList() :
                activeSidebarItem === "Analytics" ? renderAnalytics() :
                  activeSidebarItem === "Settings" ? renderSettings() :
                    <div style={S.emptyState}>Module '{activeSidebarItem}' is under development.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SaaS STYLES ─────────────────────────────────────────────────────────────
const getStyles = (isDark) => ({
  // We force the premium Light Mode aesthetic
  layout: { display: "flex", flexDirection: "row", height: "100vh", width: "100vw", backgroundColor: "#F8FAFC", fontFamily: "'Inter', sans-serif", color: "#0F172A", overflow: "hidden", boxSizing: "border-box" },

  // Body Layout
  bodyWrapper: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" },

  // Topbar
  topbar: { height: "72px", backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", flexShrink: 0, zIndex: 50, boxSizing: "border-box" },
  topbarLeft: { display: "flex", alignItems: "center" },
  topbarRight: { display: "flex", alignItems: "center" },
  logoIcon: { width: "36px", height: "36px", borderRadius: "10px", background: "#FF5A00", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.4rem", flexShrink: 0 },
  logoText: { color: "#0F172A", fontWeight: "800", letterSpacing: "-0.02em", fontSize: "1.25rem", whiteSpace: "nowrap", marginLeft: "12px" },
  avatarBtn: { width: "40px", height: "40px", borderRadius: "12px", background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#0F172A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },

  // Dropdown
  dropdownMenu: { position: "absolute", top: "120%", right: "0", width: "220px", backgroundColor: "#FFFFFF", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0", overflow: "hidden", zIndex: 100 },
  dropdownHeader: { padding: "16px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  userName: { fontWeight: "600", color: "#0F172A", fontSize: "0.875rem" },
  userEmail: { color: "#64748B", fontSize: "0.75rem", marginTop: "2px" },
  userRoleBadge: { display: "inline-block", marginTop: "6px", padding: "2px 8px", backgroundColor: "#F1F5F9", color: "#64748B", fontSize: "0.65rem", fontWeight: "700", borderRadius: "4px" },
  dropdownDivider: { height: "1px", backgroundColor: "#F1F5F9" },
  dropdownItemLogout: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", border: "none", backgroundColor: "#FFFFFF", color: "#EF4444", fontSize: "0.875rem", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" },

  // Notifications
  iconBtn: { background: "none", border: "none", color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", transition: "background 0.2s", position: "relative" },
  notificationDot: { position: "absolute", top: "2px", right: "2px", backgroundColor: "#FF5A00", color: "#fff", fontSize: "10px", fontWeight: "bold", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FFFFFF" },
  notificationsDropdown: { position: "absolute", top: "120%", right: "0", width: "380px", backgroundColor: "#FFFFFF", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0", overflow: "hidden", zIndex: 100 },
  notificationsHeader: { padding: "12px 16px", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", fontWeight: "600", color: "#0F172A", fontSize: "0.875rem" },
  notificationItem: { padding: "16px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", transition: "background-color 0.15s", ":hover": { backgroundColor: "#F8FAFC" } },
  approveBtn: { backgroundColor: "#FF5A00", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "background 0.2s", alignSelf: "center", boxShadow: "0 1px 2px rgba(255, 90, 0, 0.2)" },

  // Sidebar
  sidebar: { backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)" },
  sidebarHeader: { height: "72px", display: "flex", alignItems: "center", borderBottom: "1px solid #E2E8F0", flexShrink: 0, paddingLeft: "20px" },
  sidebarNav: { padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px" },
  sidebarNavItem: { display: "flex", alignItems: "center", gap: "12px", borderRadius: "10px", fontSize: "0.9rem", fontWeight: 600, color: "#64748B", cursor: "pointer", transition: "all 0.2s ease", overflow: "hidden", boxSizing: "border-box" },
  sidebarNavItemActive: { backgroundColor: "#FFF7F5", color: "#FF5A00", borderLeft: "3px solid #FF5A00" },
  sidebarIcon: { display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", flexShrink: 0 },

  // Main Area
  mainArea: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden", color: "#0F172A" },
  mainContent: { maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "3rem 2.5rem", boxSizing: "border-box" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" },

  // Typography
  pageTitle: { fontSize: "2rem", fontWeight: 800, color: "#0F172A", margin: "0 0 8px 0", letterSpacing: "-0.03em" },
  pageSubtitle: { fontSize: "1rem", color: "#64748B", margin: 0 },

  // Fleet Grid & Cards
  storeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" },
  storeCard: { backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", cursor: "pointer" },
  storeCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  storeIcon: { width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#FFF7F5", border: "1px solid #FFD8CC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 },
  storeName: { fontSize: "1.1rem", fontWeight: 800, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.01em" },
  storeLocation: { fontSize: "0.85rem", color: "#64748B", margin: 0 },

  // Status Badges
  statusBadgeLive: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", backgroundColor: "#F0FDF4", border: "1px solid #DCFCE7", color: "#16A34A", fontSize: "0.75rem", fontWeight: 700 },
  statusBadgeOffline: { display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B", fontSize: "0.75rem", fontWeight: 700 },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" },

  // Card Metrics
  storeMetrics: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #F1F5F9" },
  metricBox: { display: "flex", flexDirection: "column", gap: "4px" },
  metricLabel: { fontSize: "0.75rem", color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  metricValue: { fontSize: "1.1rem", color: "#0F172A", fontWeight: 800 },

  // Command Center specific
  commandHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1.5rem', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid #E2E8F0' },
  commandIcon: { width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" },
  avatarBtnLg: { width: "48px", height: "48px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" },

  // Additional Buttons
  actionBtnBlue: { width: "100%", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF", backgroundColor: "#0F172A", border: "none", cursor: "pointer", transition: "background 0.2s" },
  actionBtnRedOutline: { padding: "8px 16px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 700, color: "#EF4444", backgroundColor: "#FFFFFF", border: "1px solid #FEE2E2", cursor: "pointer", transition: "all 0.2s" },

  // Stats Grid
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" },
  statCard: { backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", boxSizing: "border-box" },
  statHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: "0.875rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { fontSize: "2.25rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", lineHeight: "1" },
  trendBadge: { fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", display: "inline-flex", alignItems: "center" },

  // Cards
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" },
  card: { backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", boxSizing: "border-box" },
  cardHeader: { padding: "1.5rem", borderBottom: "1px solid #F1F5F9", boxSizing: "border-box" },
  cardTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", margin: 0 },

  // Tabs
  tabs: { display: "flex", gap: "2rem", borderBottom: "1px solid #E2E8F0", marginBottom: "2rem" },
  tabBtn: { padding: "0 0 1rem 0", border: "none", background: "none", color: "#64748B", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", borderBottom: "2px solid transparent", transition: "all 0.2s" },
  tabBtnActive: { color: "#FF5A00", borderBottomColor: "#FF5A00" },

  // Tables
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  tr: { borderBottom: "1px solid #F1F5F9", transition: "background-color 0.2s", cursor: "pointer" },
  td: { padding: "1.25rem 1.5rem", verticalAlign: "middle", color: "#475569" },

  // Buttons
  primaryBtn: { padding: "10px 20px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 700, color: "#fff", backgroundColor: "#FF5A00", border: "none", cursor: "pointer", transition: "transform 0.1s", boxShadow: "0 4px 6px rgba(255, 90, 0, 0.2)" },
  actionBtn: { padding: "8px 16px", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, color: "#0F172A", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  downloadButton: { padding: "10px 18px", borderRadius: "8px", fontSize: "0.9rem", fontWeight: 700, color: "#475569", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  linkBtn: { background: "none", border: "none", color: "#FF5A00", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: "1rem", display: "inline-flex", alignItems: "center", transition: "all 0.2s" },

  emptyState: { padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: "#64748B", fontSize: "1rem", textAlign: "center", fontWeight: 500 }
});
