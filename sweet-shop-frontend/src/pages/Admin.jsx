import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const styles = {
    active: { bg: "#ecfdf5", color: "#047857", border: "1px solid #10b98133" },
    inactive: { bg: "#f8fafc", color: S.pageSubtitle.color, border: "1px solid #cbd5e1" },
    pending: { bg: "#fffbeb", color: "#b45309", border: "1px solid #f59e0b33" }
  };
  const s = styles[status?.toLowerCase()] || styles.inactive;
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
  const [pendingManagers, setPendingManagers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("adminDarkMode") === "true");
  const S = useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  // Global Data
  const { data: dbBranches = [] } = useBranches();
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
    } else {
      fetchReport("month"); // default to month for dashboard charts
      if (role === "ADMIN") fetchPendingManagers();
    }
  }, [isAuthenticated, role, navigate, selectedBranchId, activeSidebarItem]);

  const fetchPendingManagers = async () => {
    try {
      const res = await api.get("/admin/managers/pending");
      setPendingManagers(res.data.managers || []);
    } catch (err) {
      console.error("Failed to fetch pending managers", err);
    }
  };

  const handleApproveManager = async (managerId) => {
    try {
      await api.put(`/admin/managers/${managerId}/approve`);
      toast.success("Manager approved!");
      fetchPendingManagers(); // refresh list
    } catch (err) {
      handleApiError(err, "Failed to approve manager");
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

  // Map real branches from DB
  const displayBranches = dbBranches.map(b => ({
    id: b.id, name: b.name, location: b.location,
    managerName: b.manager?.name, managerEmail: b.manager?.email, managerPhone: b.manager?.phone || "+91 9999999999",
    status: b.managerId ? 'active' : 'inactive',
    revenue: 0 // Would ideally come from stats API per branch
  }));

  const activeBranchesCount = displayBranches.filter(b => b.status === 'active').length;

  // Chart Data Preparation (using real sales list or falling back to empty shape)
  const revenueChartData = useMemo(() => {
    if (salesList.length === 0) return Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, revenue: 0 }));
    // Simple group by date (assuming short lists, normally backend groups this)
    const grouped = {};
    salesList.forEach(s => {
      const d = new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      grouped[d] = (grouped[d] || 0) + s.totalAmount;
    });
    return Object.keys(grouped).slice(-30).map(k => ({ date: k, revenue: grouped[k] }));
  }, [salesList]);

  const pieData = [
    { name: 'Dine-in', value: 45, color: S.pageTitle.color },
    { name: 'Delivery', value: 35, color: '#3b82f6' },
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
          <div style={{ height: 300, padding: "1.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
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

        <div style={S.card}>
          <div style={S.cardHeader}><h2 style={S.cardTitle}>Top Branches</h2></div>
          <div style={{ padding: "1rem" }}>
            {displayBranches.length === 0 ? (
              <div style={S.emptyState}>No branches to rank</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {displayBranches.slice(0, 5).map((b, i) => (
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

  const renderBranchesList = () => (
    <div style={S.mainContent}>
      <div style={S.headerRow}>
        <div>
          <h1 style={S.pageTitle}>Restaurants</h1>
          <p style={S.pageSubtitle}>Manage your individual restaurant locations and access their details.</p>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Branch Details</th>
                <th style={S.th}>Assigned Manager</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>MTD Revenue</th>
                <th style={{ ...S.th, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {displayBranches.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div style={S.emptyState}>
                      <Icons.Branches />
                      <span>No branches found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayBranches.map(branch => (
                  <motion.tr key={branch.id} style={S.tr} whileHover={{ backgroundColor: S.layout.backgroundColor }} onClick={() => setSelectedBranchId(branch.id)}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600, color: S.pageTitle.color }}>{branch.name}</div>
                      <div style={{ fontSize: "0.8rem", color: S.pageSubtitle.color }}>{branch.location}</div>
                    </td>
                    <td style={S.td}>
                      {branch.managerName ? (
                        <div>
                          <div style={{ color: S.pageTitle.color, fontSize: "0.875rem", fontWeight: 500 }}>{branch.managerName}</div>
                          <div style={{ color: S.pageSubtitle.color, fontSize: "0.75rem" }}>{branch.managerEmail}</div>
                        </div>
                      ) : (
                        <span style={{ color: S.pageSubtitle.color, fontSize: "0.875rem" }}>Unassigned</span>
                      )}
                    </td>
                    <td style={S.td}><StatusBadge status={branch.status} /></td>
                    <td style={S.td}><span style={{ color: S.pageTitle.color, fontSize: "0.875rem", fontWeight: 500 }}>{formatCurrency(branch.revenue)}</span></td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBranchId(branch.id); }} style={S.actionBtn}>View Details</button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBranchDetail = () => {
    const branch = displayBranches.find(b => b.id === selectedBranchId);
    if (!branch) return null;

    return (
      <div style={S.mainContent}>
        <button onClick={() => setSelectedBranchId("")} style={S.linkBtn}>← Back to all branches</button>

        {/* Branch Header Profile */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '12px', backgroundColor: isDarkMode ? "#334155" : "#e2e8f0", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid #cbd5e1' }}>
              🏢
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4px' }}>
                <h1 style={S.pageTitle}>{branch.name}</h1>
                <StatusBadge status={branch.status} />
              </div>
              <p style={{ ...S.pageSubtitle, display: 'flex', gap: '1rem' }}>
                <span>📍 {branch.location}</span>
                <span>📋 MGR: {branch.managerName || 'None'}</span>
              </p>
            </div>
          </div>
          <button style={S.secondaryBtn}>Edit Settings</button>
        </div>

        {/* Branch Tabs */}
        <div style={S.tabs}>
          {[["overview", "Financial Overview"], ["inventory", "Menu & Inventory"], ["add", "Add Item"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveBranchTab(key)} style={{ ...S.tabBtn, ...(activeBranchTab === key ? S.tabBtnActive : {}) }}>{label}</button>
          ))}
        </div>

        {activeBranchTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Manager Info & Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

              {/* Manager Card */}
              <div style={{ ...S.card, padding: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: S.pageSubtitle.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Branch Manager</h3>
                {branch.managerName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: S.sidebarNavItemActive.backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.pageTitle.color }}>
                        <Icons.Users />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: S.pageTitle.color }}>{branch.managerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span> Active Account</div>
                      </div>
                    </div>
                    <div style={{ height: '1px', backgroundColor: isDarkMode ? "#334155" : "#e2e8f0" }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: S.pageSubtitle.color }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Mail /> {branch.managerEmail}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icons.Phone /> {branch.managerPhone}</div>
                    </div>
                  </div>
                ) : (
                  <div style={S.emptyState}>No manager assigned</div>
                )}
              </div>

              {/* Specific Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <StatCard styles={S} label="Total Revenue (All Time)" value={formatCurrency(reportSummary.totalAmount)} trend="+12.4% vs last month" isPositive={true} />
                <StatCard styles={S} label="Today's Revenue" value={formatCurrency(reportSummary.totalAmount * 0.05)} trend="-2.1% vs yesterday" isPositive={false} />
                <StatCard styles={S} label="Total Orders" value={reportSummary.count} trend="Average 42/day" isPositive={true} />
                <StatCard styles={S} label="AOV (Avg Order Val)" value={formatCurrency(reportSummary.totalAmount / (reportSummary.count || 1))} isPositive={true} />
              </div>
            </div>

            {/* Charts Row */}
            <div style={S.chartGrid}>
              <div style={{ ...S.card, gridColumn: "span 2" }}>
                <div style={S.cardHeader}><h2 style={S.cardTitle}>Daily Order Volume</h2></div>
                <div style={{ height: 300, padding: "1.5rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: S.pageSubtitle.color, fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: S.pageSubtitle.color, fontSize: 12 }} dx={-10} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardHeader}><h2 style={S.cardTitle}>Revenue Breakdown</h2></div>
                <div style={{ height: 300, padding: "1rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `${val}%`} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem', color: S.pageSubtitle.color }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* Existing Inventory Functionality retained visually but cleaner */}
        {activeBranchTab === "inventory" && <ProductInventoryList categories={categories} inventoryCategory={inventoryCategory} setInventoryCategory={setInventoryCategory} inventorySearch={inventorySearch} setInventorySearch={setInventorySearch} filteredInventory={filteredInventory} stockInputs={stockInputs} handleStockInputChange={handleStockInputChange} adjustStock={adjustStock} saveStockUpdate={saveStockUpdate} handleDeleteProduct={handleDeleteProduct} />}
        {activeBranchTab === "add" && <AddProductForm handleAddProduct={handleAddProduct} newProduct={{ ...newProduct, branchId: selectedBranchId }} handleChange={handleChange} categories={categories} branches={dbBranches} role={role} />}
      </div>
    );
  };

  // ─── ANALYTICS COMPONENT ───────────────────────────────────────────────────
  const renderAnalytics = () => {
    // Top Products Aggregation
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

    return (
      <div style={S.mainContent}>
        <div style={S.headerRow}>
          <div>
            <h1 style={S.pageTitle}>Analytics & Reports</h1>
            <p style={S.pageSubtitle}>Deep dive into your business performance and insights.</p>
          </div>
        </div>

        <div style={S.chartGrid}>
          {/* Top Selling Products */}
          <div style={S.card}>
            <div style={S.cardHeader}><h2 style={S.cardTitle}>Top Selling Items</h2></div>
            <div style={{ padding: "1rem" }}>
              {topSellingProducts.length === 0 ? (
                <div style={S.emptyState}>No sales data available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {topSellingProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: S.cardHeader.borderBottom }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '8px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                          #{i + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: S.pageTitle.color, fontSize: '0.875rem' }}>{p.name}</div>
                          <div style={{ color: S.pageSubtitle.color, fontSize: '0.75rem' }}>{p.qty} units sold</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: S.pageTitle.color, fontSize: '0.875rem' }}>{formatCurrency(p.revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue by Branch */}
          <div style={S.card}>
            <div style={S.cardHeader}><h2 style={S.cardTitle}>Branch Performance Ranked</h2></div>
            <div style={{ padding: "1rem" }}>
              {displayBranches.length === 0 ? (
                <div style={S.emptyState}>No branches available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[...displayBranches].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((b, i) => (
                    <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: i === 0 ? '#fef3c7' : '#f8fafc', color: i === 0 ? '#b45309' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
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

        {/* Profile Section */}
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

        {/* Preferences Section */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: S.pageTitle.color, borderBottom: S.cardHeader.borderBottom, paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            System Preferences
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, color: S.pageTitle.color, fontSize: '0.9rem' }}>Dark Mode</div>
                <div style={{ color: S.pageSubtitle.color, fontSize: '0.8rem' }}>Enable dark theme across the admin console.</div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={isDarkMode} onChange={(e) => {
                  setIsDarkMode(e.target.checked);
                  localStorage.setItem("adminDarkMode", e.target.checked);
                }} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isDarkMode ? '#10b981' : '#cbd5e1', borderRadius: '34px', transition: '.4s' }}>
                  <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: isDarkMode ? '22px' : '4px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                </span>
              </label>
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
            <div style={S.logoIcon}>F</div>
            {!isSidebarCollapsed && <span style={S.logoText}>FoodFlow</span>}
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
          <div style={{ marginTop: "auto", padding: isSidebarCollapsed ? "16px 12px" : "16px", borderTop: "1px solid #e2e8f0" }}>
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

            {/* NOTIFICATIONS / PENDING MANAGERS */}
            {role === "ADMIN" && (
              <div style={{ position: "relative", marginRight: "1rem" }}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', borderRadius: '6px', border: S.cardHeader.borderBottom,
                    backgroundColor: S.sidebar.backgroundColor, color: S.pageTitle.color, fontSize: '0.875rem',
                    fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
                  }}
                >
                  <Icons.Users />
                  Pending Requests
                  {pendingManagers.length > 0 && (
                    <span style={{
                      backgroundColor: '#ef4444', color: '#fff', fontSize: '0.7rem',
                      fontWeight: 700, padding: '2px 6px', borderRadius: '100px',
                      marginLeft: '4px'
                    }}>
                      {pendingManagers.length}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div style={S.notificationsDropdown}>
                    <div style={S.notificationsHeader}>
                      <span>Pending Requests</span>
                    </div>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {pendingManagers.length === 0 ? (
                        <div style={{ padding: "16px", textAlign: "center", color: S.pageSubtitle.color, fontSize: "0.875rem" }}>
                          No pending requests
                        </div>
                      ) : (
                        pendingManagers.map(manager => (
                          <div key={manager.id} style={S.notificationItem}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ fontWeight: 600, color: S.pageTitle.color, fontSize: "0.9rem" }}>{manager.name || "New Manager"}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: S.pageSubtitle.color, fontSize: "0.8rem" }}>
                                <Icons.Mail /> {manager.email}
                              </div>
                              {manager.phone && (
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: S.pageSubtitle.color, fontSize: "0.8rem" }}>
                                  <Icons.Phone /> {manager.phone}
                                </div>
                              )}
                              <div style={{ display: "inline-block", marginTop: "4px", fontSize: "0.7rem", color: S.pageSubtitle.color, fontWeight: 500 }}>
                                Signed up: {new Date(manager.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <button onClick={() => handleApproveManager(manager.id)} style={S.approveBtn}>
                              Approve
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
  layout: { display: "flex", flexDirection: "row", height: "100vh", backgroundColor: isDark ? "#0f172a" : "#f8fafc", fontFamily: "'Inter', sans-serif", color: isDark ? "#f8fafc" : "#0f172a" },

  // Topbar
  topbar: { height: "64px", backgroundColor: isDark ? "#1e293b" : "#fff", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", flexShrink: 0 },
  topbarLeft: { display: "flex", alignItems: "center" },
  topbarRight: { display: "flex", alignItems: "center" },
  logoIcon: { width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", fontStyle: "italic", flexShrink: 0 },
  logoText: { color: isDark ? "#f8fafc" : "#1e293b", fontWeight: "800", letterSpacing: "0.5px", fontSize: "1.25rem", whiteSpace: "nowrap" },
  collapseBtn: { background: "none", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, cursor: "pointer", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", borderRadius: "6px", transition: "background 0.2s" },
  avatarBtn: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(236,72,153,0.3)", transition: "transform 0.2s" },

  // Dropdown
  dropdownMenu: { position: "absolute", top: "120%", right: "0", width: "220px", backgroundColor: isDark ? "#1e293b" : "#fff", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, overflow: "hidden", zIndex: 100 },
  dropdownHeader: { padding: "16px", backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
  userName: { fontWeight: "600", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.875rem" },
  userEmail: { color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.75rem", marginTop: "2px" },
  userRoleBadge: { display: "inline-block", marginTop: "6px", padding: "2px 8px", backgroundColor: isDark ? "#334155" : "#e2e8f0", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.65rem", fontWeight: "700", borderRadius: "4px" },
  dropdownDivider: { height: "1px", backgroundColor: isDark ? "#334155" : "#e2e8f0" },
  dropdownItemLogout: { display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "12px 16px", border: "none", backgroundColor: isDark ? "#1e293b" : "#fff", color: "#dc2626", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer", transition: "background-color 0.2s" },

  // Notifications
  iconBtn: { background: "none", border: "none", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px", borderRadius: "50%", transition: "background 0.2s", position: "relative" },
  notificationDot: { position: "absolute", top: "2px", right: "2px", backgroundColor: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: "bold", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" },
  notificationsDropdown: { position: "absolute", top: "120%", right: "0", width: "380px", backgroundColor: isDark ? "#1e293b" : "#fff", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, overflow: "hidden", zIndex: 100 },
  notificationsHeader: { padding: "12px 16px", backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontWeight: "600", color: isDark ? "#f8fafc" : "#0f172a", fontSize: "0.875rem" },
  notificationItem: { padding: "16px", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", transition: "background-color 0.15s", ":hover": { backgroundColor: isDark ? "#334155" : "#f8fafc" } },
  approveBtn: { backgroundColor: "#10b981", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", transition: "background 0.2s", alignSelf: "center", boxShadow: "0 1px 2px rgba(16, 185, 129, 0.2)" },

  // Body Layout
  bodyWrapper: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" },

  // Sidebar
  sidebar: { backgroundColor: isDark ? "#1e293b" : "#fff", borderRight: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)" },
  sidebarHeader: { height: "64px", display: "flex", alignItems: "center", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, gap: "10px", flexShrink: 0 },
  sidebarNav: { padding: "16px 12px", display: "flex", flexDirection: "column", gap: "8px" },
  sidebarNavItem: { display: "flex", alignItems: "center", gap: "12px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#cbd5e1" : "#475569", cursor: "pointer", transition: "all 0.15s ease", overflow: "hidden" },
  sidebarNavItemActive: { backgroundColor: isDark ? "#334155" : "#f1f5f9", color: isDark ? "#f8fafc" : "#0f172a", fontWeight: 600 },
  sidebarIcon: { display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", flexShrink: 0 },

  // Main Area
  mainArea: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", color: isDark ? "#f8fafc" : "#0f172a" },
  mainContent: { maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "2.5rem 2rem" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" },

  // Typography
  pageTitle: { fontSize: "1.5rem", fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", margin: "0 0 4px 0", letterSpacing: "-0.01em" },
  pageSubtitle: { fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0 },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" },
  statCard: { backgroundColor: isDark ? "#1e293b" : "#fff", borderRadius: "8px", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" },
  statHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#94a3b8" : "#64748b" },
  statValue: { fontSize: "1.875rem", fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: "-0.02em", lineHeight: "1.2" },
  trendBadge: { fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "100px", alignSelf: "flex-start", display: "inline-flex", alignItems: "center" },

  // Cards & Tables
  chartGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" },
  card: { backgroundColor: isDark ? "#1e293b" : "#fff", borderRadius: "8px", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, overflow: "hidden", display: "flex", flexDirection: "column" },
  cardHeader: { padding: "1rem 1.25rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
  cardTitle: { fontSize: "0.9rem", fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "0.75rem 1.25rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", backgroundColor: isDark ? "#0f172a" : "#f8fafc", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
  tr: { borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, transition: "background-color 0.15s", cursor: "pointer" },
  td: { padding: "1rem 1.25rem", verticalAlign: "middle", color: isDark ? "#f8fafc" : "#0f172a" },

  // Buttons
  primaryBtn: { padding: "8px 16px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, color: "#fff", backgroundColor: isDark ? "#3b82f6" : "#0f172a", border: "none", cursor: "pointer" },
  actionBtn: { padding: "6px 12px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#f8fafc" : "#0f172a", backgroundColor: isDark ? "#334155" : "#fff", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, cursor: "pointer", transition: "all 0.15s" },
  secondaryBtn: { padding: "6px 12px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#cbd5e1" : "#475569", backgroundColor: isDark ? "#1e293b" : "#fff", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, cursor: "pointer" },
  linkBtn: { padding: 0, border: "none", background: "none", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" },

  // Tabs
  tabs: { display: "flex", gap: "1.5rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, marginBottom: "1.5rem" },
  tabBtn: { padding: "0 0 0.75rem 0", border: "none", background: "none", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", borderBottom: "2px solid transparent", transition: "all 0.15s" },
  tabBtnActive: { color: isDark ? "#f8fafc" : "#0f172a", borderBottomColor: isDark ? "#f8fafc" : "#0f172a" },

  emptyState: { padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.875rem", textAlign: "center" }
});
