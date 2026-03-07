import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axios";
import { useProducts, useAddProduct, useDeleteProduct, useUpdateProductStock, useUpdateProductAvailability } from "../hooks/useProducts";
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
import ConfirmationModal from "../components/ui/ConfirmationModal";

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
function StatCard({ label, value, trend, isPositive }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm box-border">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none">{value}</div>
      {trend && (
        <div className={`text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center w-fit ${isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          }`}>
          {isPositive ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusClasses = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-slate-50 text-slate-500 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200"
  };
  const cls = statusClasses[status?.toLowerCase()] || statusClasses.inactive;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cls}`}>
      {status || 'Unknown'}
    </span>
  );
}

// ─── DOC VIEWER STYLES & COMPONENTS ──────────────────────────────────────────
function DocLink({ label, url, onPreview }) {
  if (!url) return null;

  const fullUrl = url.startsWith("http") ? url : `http://localhost:4000${url}`;

  return (
    <div className="flex justify-between items-center p-3 px-4 bg-white rounded-xl border border-slate-200 transition-all">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <button
        onClick={() => onPreview({ label, url: fullUrl })}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:opacity-70 transition-opacity bg-none border-none cursor-pointer p-0"
      >
        View
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </button>
    </div>
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
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [branchFilterStatus, setBranchFilterStatus] = useState("All");
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    type: "danger"
  });
  // const S = useMemo(() => getStyles(isDarkMode), [isDarkMode]);

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
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", dietType: "", imageUrl: "", branchId: "" });
  const [stockInputs, setStockInputs] = useState({});
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState("All");

  // Reports State
  const [reportSummary, setReportSummary] = useState({ totalAmount: 0, count: 0, totalCommission: 0 });
  const [salesList, setSalesList] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Mutations
  const addProductMutation = useAddProduct();
  const deleteProductMutation = useDeleteProduct();
  const updateStockMutation = useUpdateProductStock();
  const updateAvailabilityMutation = useUpdateProductAvailability();

  const categories = ["Starters", "Soups", "Main Course", "Breads/Rotis", "Desserts", "Mocktails"];

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
      setReportSummary({
        totalAmount: data.totalAmount || 0,
        count: data.count || 0,
        totalCommission: data.totalCommission || 0
      });
      setSalesList(data.sales || []);
    } catch (err) {
      handleApiError(err, "Failed to load reports");
      setSalesList([]); setReportSummary({ totalAmount: 0, count: 0, totalCommission: 0 });
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
      status: b.storeStatus?.toLowerCase() === 'verified' ? (b.isVisible ? 'active' : 'paused') :
        (b.storeStatus?.toLowerCase() === 'under_review' || b.storeStatus?.toLowerCase() === 'pending' ? 'pending' :
          b.storeStatus?.toLowerCase() === 'rejected' ? 'rejected' : 'inactive'),
      rawStatus: b.storeStatus,
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
    { name: 'Dine-in', value: 45, color: '#FF5A00' },
    { name: 'Takeaway', value: 20, color: '#10b981' },
  ];

  // Logic handlers
  const toggleAvailability = (id, currentStatus) => {
    setConfirmConfig({
      isOpen: true,
      title: "Update Availability",
      message: `Are you sure you want to mark this item as ${currentStatus ? 'Sold Out' : 'In Stock'}?`,
      confirmText: "Yes, Update",
      type: "orange",
      onConfirm: () => {
        updateAvailabilityMutation.mutate({ id, isAvailable: !currentStatus }, {
          onSuccess: () => toast.success("Availability updated!"),
          onError: (err) => handleApiError(err, "Update failed")
        });
      }
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = newProduct.name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    addProductMutation.mutate({ ...newProduct, name, branchId: newProduct.branchId === "" ? null : newProduct.branchId }, {
      onSuccess: () => { toast.success(`"${name}" added!`); setNewProduct({ name: "", price: "", category: "", dietType: "", imageUrl: "", branchId: "" }); },
      onError: (err) => handleApiError(err, "Failed to add product")
    });
  };

  const handleDeleteProduct = (id) => {
    setConfirmConfig({
      isOpen: true,
      title: "Permanent Deletion",
      message: "Are you sure you want to permanently delete this item? This action cannot be undone.",
      confirmText: "Delete Permanently",
      type: "danger",
      onConfirm: () => {
        deleteProductMutation.mutate(id, {
          onSuccess: () => toast.success("Deleted!"),
          onError: (err) => handleApiError(err, "Delete failed")
        });
      }
    });
  };
  const filteredInventory = products.filter(s => s.name.toLowerCase().includes(inventorySearch.toLowerCase()) && (inventoryCategory === "All" || s.category === inventoryCategory)).sort((a, b) => a.name.localeCompare(b.name));

  // ─── RENDERERS ─────────────────────────────────────────────────────────────

  const renderDashboardGlobal = () => (
    <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Dashboard overview</h1>
          <p className="text-base text-slate-500 font-medium">System-wide aggregate performance metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-12">
        <StatCard label="Total Revenue" value={formatCurrency(reportSummary.totalAmount)} />
        <StatCard label="Platform Earnings" value={formatCurrency(reportSummary.totalCommission)} />
        <StatCard label="Active Branches" value={activeBranchesCount} />
        <StatCard label="Total Orders" value={reportSummary.count} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border lg:col-span-2">
          <div className="p-6 border-b border-slate-50 box-border">
            <h2 className="text-lg font-bold text-slate-900 m-0">Revenue Last 30 Days</h2>
          </div>
          <div className="px-6 pb-6 box-border">
            <div className="h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#FF5A00" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#FF5A00", stroke: isDarkMode ? '#1e293b' : '#fff', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border">
          <div className="p-6 border-b border-slate-50 box-border">
            <h2 className="text-lg font-bold text-slate-900 m-0">Top Branches</h2>
          </div>
          <div className="p-4">
            {displayBranches.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-base text-center font-medium">No branches to rank</div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayBranches
                  .filter(b => b.status === 'active' || b.status === 'paused')
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 5)
                  .map((b, i) => (
                    <div key={b.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-500"
                          }`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{b.name}</div>
                          <div className="text-slate-500 text-[10px] font-medium leading-none mt-0.5">{b.location}</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{formatCurrency(b.revenue)}</div>
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
    const authorizedBranches = (role === "ADMIN"
      ? displayBranches
      : displayBranches.filter(b => b.managerEmail === user?.email)
    );

    const filteredBranches = authorizedBranches.filter(b => {
      if (branchFilterStatus === "All") return true;
      if (branchFilterStatus === "Active") return b.status === "active";
      if (branchFilterStatus === "Paused") return b.status === "paused";
      if (branchFilterStatus === "Pending") return b.status === "pending";
      return true;
    });

    const statusCounts = {
      All: authorizedBranches.length,
      Active: authorizedBranches.filter(b => b.status === "active").length,
      Paused: authorizedBranches.filter(b => b.status === "paused").length,
      Pending: authorizedBranches.filter(b => b.status === "pending").length,
    };

    return (
      <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{role === "ADMIN" ? "Restaurant Fleet" : "My Restaurant"}</h1>
            <p className="text-base text-slate-500 font-medium">
              {role === "ADMIN" ? "Monitor live status and revenue across all locations." : "Manage your specific location's performance and menu."}
            </p>
          </div>
          {role === "ADMIN" && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
              {Object.keys(statusCounts).map((status) => (
                <button
                  key={status}
                  onClick={() => setBranchFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${branchFilterStatus === status
                    ? "bg-white text-[#FF5A00] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {status}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${branchFilterStatus === status ? "bg-orange-50 text-[#FF5A00]" : "bg-slate-200 text-slate-600"
                    }`}>
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredBranches.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-base text-center font-medium">
            <Icons.Branches />
            <h3 className="text-lg font-bold text-slate-900 m-0">No Restaurants Found</h3>
            <p>No restaurants match the selected status filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
            {filteredBranches.map(branch => (
              <motion.div
                key={branch.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm cursor-pointer"
                whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedBranchId(branch.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7F5] border border-[#FFD8CC] flex items-center justify-center text-2xl flex-shrink-0">🍔</div>
                    <div>
                      <h3 className="text-[1.1rem] font-extrabold text-slate-900 mb-1 tracking-tight">{branch.name}</h3>
                      <p className="text-[0.85rem] text-slate-500 m-0">{branch.location}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-bold border ${branch.status === 'active' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                    branch.status === 'paused' ? "bg-slate-50 border-slate-200 text-slate-400" :
                      branch.status === 'pending' ? "bg-amber-50 border-amber-200 text-amber-600" :
                        "bg-slate-50 border-slate-200 text-slate-500"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? "bg-emerald-500" :
                      branch.status === 'pending' ? "bg-amber-500" :
                        "bg-slate-400"
                      }`}></span>
                    {branch.status === 'active' ? 'Accepting Orders' :
                      branch.status === 'paused' ? 'Inactive' :
                        branch.status === 'pending' ? 'Pending Review' :
                          'Offline'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-slate-500 font-bold uppercase tracking-wider">Today's Rev</span>
                    <span className="text-[1.1rem] text-slate-900 font-extrabold">{formatCurrency(branch.revenue || 0)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.75rem] text-slate-500 font-bold uppercase tracking-wider">Manager</span>
                    <span className="text-[0.9rem] text-slate-600 font-extrabold">
                      {branch.managerName ? branch.managerName.split(' ')[0] : 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <button className="w-full py-2.5 rounded-lg text-[0.9rem] font-bold text-white bg-slate-900 border-none cursor-pointer transition-colors hover:bg-slate-800">
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
      <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
        <button onClick={() => setSelectedBranchId("")} className="bg-none border-none text-[#FF5A00] text-[0.9rem] font-bold cursor-pointer p-0 mb-4 inline-flex items-center transition-all hover:opacity-80">← Back to Fleet Dashboard</button>

        <div className="flex justify-between items-start mt-6 mb-10 pb-8 border-b border-slate-200">
          <div className="flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[2rem] shadow-sm">🏢</div>
            <div>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900 m-0 tracking-tight">{branch.name}</h1>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-bold border ${branch.status === 'active' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                  branch.status === 'paused' ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                  {branch.status === 'active' ? 'Live' : (branch.status === 'paused' ? 'Inactive' : 'Offline')}
                </div>
              </div>
              <p className="text-base text-slate-500 m-0 flex gap-6">
                <span className="font-medium">📍 {branch.location}</span>
                <span className="font-medium">📋 MGR: {branch.managerName || 'Pending Assignment'}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-blue-600 text-[0.875rem] font-bold cursor-pointer transition-all duration-200 shadow-sm hover:bg-blue-50 hover:border-blue-200"
              onClick={() => setIsDocsModalOpen(true)}
            >
              <Icons.Menu />
              View Documents
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-[0.875rem] font-bold cursor-pointer transition-all duration-200 shadow-sm hover:bg-slate-50 hover:border-slate-300"
              onClick={() => setIsSettingsModalOpen(true)}
            >
              <Icons.Settings />
              Store Settings
            </button>
          </div>
        </div>

        <div className="flex gap-8 border-b border-slate-200 mb-8">
          {[["overview", "Live Performance"], ["menu", "Menu Configuration"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveBranchTab(key)}
              className={`pb-4 border-b-2 bg-none text-[0.95rem] font-semibold cursor-pointer transition-all ${activeBranchTab === key ? "text-[#FF5A00] border-[#FF5A00]" : "text-slate-500 border-transparent hover:text-slate-700"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeBranchTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Real-time KPIs */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-12">
              <StatCard label="Revenue (MTD)" value={formatCurrency(reportSummary.totalAmount)} trend="+12.4%" isPositive={true} />
              <StatCard label="Total Orders" value={reportSummary.count} trend="Stable" isPositive={true} />
              <StatCard label="Avg. Ticket Size" value={formatCurrency(reportSummary.totalAmount / (reportSummary.count || 1))} />
            </div>

            {/* Manager Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm mb-8">
              <h3 className="text-lg font-bold text-slate-900 m-0">Assigned Leadership</h3>
              <div className="mt-4 flex items-center gap-4">
                {branch.managerName ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-lg"><Icons.User /></div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-[1.1rem]">{branch.managerName}</div>
                      <div className="text-slate-500 text-[0.9rem] flex gap-4 mt-1 font-medium">
                        <span>✉️ {branch.managerEmail}</span>
                        <span>📞 {branch.managerPhone}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 font-medium">No manager currently assigned to this location.</p>
                )}
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm lg:col-span-2">
                <div className="p-6 border-b border-slate-50 font-bold"><h2 className="text-lg text-slate-900 m-0">30-Day Order Volume</h2></div>
                <div className="h-[300px] p-6">
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

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-50 font-bold"><h2 className="text-lg text-slate-900 m-0">Dine-in vs Takeaway</h2></div>
                <div className="h-[300px] p-4">
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

        {activeBranchTab === "menu" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
            <ProductInventoryList
              categories={categories}
              inventoryCategory={inventoryCategory}
              setInventoryCategory={setInventoryCategory}
              inventorySearch={inventorySearch}
              setInventorySearch={setInventorySearch}
              filteredInventory={filteredInventory}
              toggleAvailability={toggleAvailability}
              handleDeleteProduct={handleDeleteProduct}
            />
          </motion.div>
        )}

        <BranchSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          branch={dbBranches.find(b => b.id === selectedBranchId)}
        />

        {/* Documents Modal */}
        {isDocsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-[4px] z-[100] flex items-center justify-center p-6" onClick={() => setIsDocsModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-900 m-0">Store Documents</h3>
                <button
                  className="bg-none border-none text-slate-400 cursor-pointer p-1.5 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setIsDocsModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex justify-center items-center min-h-[400px] bg-slate-50">
                <div className="flex flex-col gap-4 w-full max-w-[400px]">
                  <DocLink
                    label="FSSAI License"
                    url={dbBranches.find(b => b.id === selectedBranchId)?.fssaiPdfUrl}
                    onPreview={setSelectedDoc}
                  />
                  <DocLink
                    label="GST Certificate"
                    url={dbBranches.find(b => b.id === selectedBranchId)?.gstPdfUrl}
                    onPreview={setSelectedDoc}
                  />
                  <DocLink
                    label="Bank Passbook"
                    url={dbBranches.find(b => b.id === selectedBranchId)?.bankPassbookPdfUrl}
                    onPreview={setSelectedDoc}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal Component */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-[4px] z-[120] flex items-center justify-center p-6" onClick={() => setSelectedDoc(null)}>
            <div className="bg-white rounded-2xl w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 px-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-900 m-0">{selectedDoc.label}</h3>
                <button
                  className="bg-none border-none text-slate-400 cursor-pointer p-1.5 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setSelectedDoc(null)}
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex justify-center items-center min-h-[400px] bg-slate-50">
                {selectedDoc.url.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`${selectedDoc.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={selectedDoc.label}
                    className="w-full h-[500px] border-none rounded-lg bg-white shadow-sm"
                  />
                ) : (
                  <img
                    src={selectedDoc.url}
                    alt={selectedDoc.label}
                    className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400/f8fafc/64748b?text=Preview+Not+Supported';
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

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
    const platformCommission = reportSummary.totalCommission || 0;

    const netProfit = netSales - estimatedCogs - operatingExpenses - platformCommission;
    const profitMargin = netSales > 0 ? ((netProfit / netSales) * 100).toFixed(1) : 0;

    // Data for P&L Donut Chart
    const pnlChartData = [
      { name: 'Food Cost (Est)', value: estimatedCogs, fill: '#EF4444' },     // Red
      { name: 'OpEx (Est)', value: operatingExpenses, fill: '#F59E0B' },       // Amber
      { name: 'Platform Comm.', value: platformCommission, fill: '#3B82F6' }, // Blue
      { name: 'Merchant Profit', value: Math.max(0, netProfit), fill: '#10B981' } // Green
    ];

    return (
      <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Financial Reports</h1>
            <p className="text-base text-slate-500 font-medium">Profit & Loss, Tax liabilities, and item performance.</p>
          </div>
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-50 border border-orange-100 text-[#FF5A00] text-[0.9rem] font-bold cursor-pointer transition-all hover:bg-orange-100 shadow-sm"
            onClick={() => toast.success("Exporting P&L Statement...")}
          >
            📥 Export Tax Report (CSV)
          </button>
        </div>

        {/* TOP LEVEL KPIs */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4"><span className="text-[0.8rem] text-slate-500 font-bold uppercase tracking-wider">Gross Revenue (Incl GST)</span></div>
            <div className="text-[1.75rem] text-slate-900 font-extrabold tracking-tight">{formatCurrency(grossRevenue)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[0.8rem] text-slate-500 font-bold uppercase tracking-wider">GST Liability (5%)</span>
              <span className="text-[0.7rem] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-500">TAX</span>
            </div>
            <div className="text-[1.75rem] text-slate-500 font-extrabold tracking-tight">{formatCurrency(gstCollected)}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-4"><span className="text-[0.8rem] text-slate-500 font-bold uppercase tracking-wider">Net Sales</span></div>
            <div className="text-[1.75rem] text-slate-900 font-extrabold tracking-tight">{formatCurrency(netSales)}</div>
          </div>
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex flex-col shadow-[0_4px_10px_rgba(59,130,246,0.1)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[0.8rem] text-blue-600 font-bold uppercase tracking-wider">Platform Earnings</span>
              <span className="text-[0.7rem] bg-blue-100 px-1.5 py-0.5 rounded font-bold text-blue-600 space-x-1">ADMN</span>
            </div>
            <div className="text-[1.75rem] text-blue-600 font-extrabold tracking-tight">{formatCurrency(platformCommission)}</div>
            <div className="text-[0.85rem] text-blue-500 font-bold mt-1">15% Fee</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex flex-col shadow-[0_4px_10px_rgba(16,185,129,0.1)]">
            <div className="flex justify-between items-center mb-4"><span className="text-[0.8rem] text-emerald-600 font-bold uppercase tracking-wider">Merchant Net Profit</span></div>
            <div className="text-[1.75rem] text-emerald-600 font-extrabold tracking-tight">{formatCurrency(netProfit)}</div>
            <div className="text-[0.85rem] text-emerald-600 font-extrabold mt-1">{profitMargin}% Net Margin</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* PROFIT & LOSS BREAKDOWN */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm lg:col-span-2">
            <div className="p-6 border-b border-slate-50 font-bold"><h2 className="text-lg text-slate-900 m-0">Profit & Loss Statement (Estimated)</h2></div>
            <div className="p-6 flex gap-8 items-center">

              {/* Donut Chart */}
              <div className="w-[220px] h-[220px] shrink-0">
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
                  <div className="w-full h-full rounded-full border-[12px] border-slate-100 flex items-center justify-center text-slate-400 text-[0.8rem] font-bold">No Data</div>
                )}
              </div>

              {/* P&L Ledger */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold text-[0.95rem]">Net Sales (Base Revenue)</span>
                  <span className="font-extrabold text-slate-900 text-[1.05rem]">{formatCurrency(netSales)}</span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-dashed border-slate-200">
                  <span className="text-red-500 font-bold text-[0.95rem]">(-) Food Cost (Est. 35%)</span>
                  <span className="font-bold text-red-500">{formatCurrency(estimatedCogs)}</span>
                </div>
                <div className="flex justify-between pb-2.5 border-b border-dashed border-slate-200">
                  <span className="text-amber-500 font-bold text-[0.95rem]">(-) Operating Expenses (Est. 25%)</span>
                  <span className="font-bold text-amber-500">{formatCurrency(operatingExpenses)}</span>
                </div>
                <div className="flex justify-between pb-2.5 border-b-2 border-slate-200">
                  <span className="text-blue-500 font-bold text-[0.95rem]">(-) Platform Commission (15%)</span>
                  <span className="font-bold text-blue-500">{formatCurrency(platformCommission)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-emerald-500 font-extrabold text-[1.2rem]">Merchant Net Profit</span>
                  <span className="font-extrabold text-emerald-500 text-[1.2rem]">{formatCurrency(netProfit)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* MENU PERFORMANCE */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-slate-50 font-bold"><h2 className="text-lg text-slate-900 m-0">Top Selling Items</h2></div>
            <div className="p-6">
              {topSellingProducts.length === 0 ? (
                <div className="text-center text-slate-500 py-8 font-medium">No sales data recorded.</div>
              ) : (
                <div className="flex flex-col gap-5">
                  {topSellingProducts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[0.85rem] font-extrabold border ${i === 0 ? "bg-orange-50 text-[#FF5A00] border-orange-100" : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[0.95rem] mb-0.5">{p.name}</div>
                          <div className="text-slate-500 text-[0.8rem] font-medium">{p.qty} units sold</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-slate-900 text-[0.95rem]">{formatCurrency(p.revenue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ADMIN EXCLUSIVE: BRANCH RANKINGS */}
        {role === "ADMIN" && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm mt-8">
            <div className="p-6 border-b border-slate-50 font-bold"><h2 className="text-lg text-slate-900 m-0">Fleet Performance Leaderboard</h2></div>
            <div className="p-6">
              {displayBranches.length === 0 ? (
                <div className="text-slate-500 font-medium">No branches available.</div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                  {[...displayBranches].sort((a, b) => b.revenue - a.revenue).map((b, i) => (
                    <div key={b.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-sm transition-all hover:bg-white">
                      <div className="flex items-center gap-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.8rem] font-extrabold border ${i === 0 ? "bg-amber-100 text-amber-600 border-amber-200" : "bg-white text-slate-500 border-slate-200"
                          }`}>
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[0.95rem]">{b.name}</div>
                          <div className="text-slate-500 text-[0.75rem] font-medium">{b.location}</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-emerald-500 text-[1rem]">{formatCurrency(b.revenue)}</div>
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
    <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">System Settings</h1>
          <p className="text-base text-slate-500 font-medium">Manage your profile, preferences, and system configurations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-[800px] mx-auto flex flex-col gap-8 shadow-sm">
        <div>
          <h2 className="text-[1.1rem] font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
            Personal Profile
          </h2>
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[2rem] flex items-center justify-center font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <Icons.User />}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-slate-500 text-[0.875rem] font-medium">Full Name</span>
                <span className="font-semibold text-slate-900">{user?.name || "N/A"}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-slate-500 text-[0.875rem] font-medium">Email Address</span>
                <span className="font-semibold text-slate-900">{user?.email || "N/A"}</span>
              </div>
              <div className="grid grid-cols-[120px,1fr] items-center">
                <span className="text-slate-500 text-[0.875rem] font-medium">Account Role</span>
                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[0.65rem] font-bold rounded uppercase tracking-wider w-fit">{role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MENU MANAGEMENT COMPONENT ────────────────────────────────────────────────
  const renderMenuManagement = () => (
    <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Menu Management</h1>
          <p className="text-base text-slate-500 font-medium">Manage individual branch items or global menu items.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-10 items-start">
        <AddProductForm
          handleAddProduct={handleAddProduct}
          newProduct={newProduct}
          handleChange={(e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value })}
          categories={categories}
          branches={displayBranches}
          role={role}
        />
        <ProductInventoryList
          categories={categories}
          inventoryCategory={inventoryCategory}
          setInventoryCategory={setInventoryCategory}
          inventorySearch={inventorySearch}
          setInventorySearch={setInventorySearch}
          filteredInventory={filteredInventory}
          toggleAvailability={toggleAvailability}
          handleDeleteProduct={handleDeleteProduct}
        />
      </div>
    </div>
  );


  // ─── MAIN LAYOUT ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-row h-screen w-screen bg-slate-50 font-inter text-slate-900 overflow-hidden box-border">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* SIDEBAR SIDE (FULL HEIGHT) */}
      <div className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarCollapsed ? "w-[80px]" : "w-[240px]"}`}>
        <div className="flex-1 flex flex-col">

          {/* Logo Header inside Sidebar */}
          <div className={`h-[72px] flex items-center border-b border-slate-200 flex-shrink-0 ${isSidebarCollapsed ? "justify-center px-0" : "justify-start px-5"}`}>
            <div className="w-9 h-9 rounded-xl bg-[#FF5A00] text-white flex items-center justify-center font-black text-xl flex-shrink-0">V</div>
            {!isSidebarCollapsed && <span className="text-slate-900 font-extrabold tracking-tight text-xl whitespace-nowrap ml-3">Velvet Plate</span>}
          </div>

          <nav className="py-6 px-4 flex flex-col gap-2">
            {[
              { id: "Dashboard", icon: <Icons.Dashboard /> },
              { id: "Branches", icon: <Icons.Branches /> },
              { id: "Menu", icon: <Icons.Menu /> },
              { id: "Analytics", icon: <Icons.Analytics /> },
              { id: "Settings", icon: <Icons.Settings /> }
            ].map(item => (
              <div
                key={item.id}
                title={item.id}
                onClick={() => { setActiveSidebarItem(item.id); setSelectedBranchId(""); }}
                className={`flex items-center gap-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 overflow-hidden box-border ${isSidebarCollapsed ? "justify-center p-3" : "justify-start py-2.5 px-4"
                  } ${activeSidebarItem === item.id && !selectedBranchId
                    ? "bg-[#FFF7F5] text-[#FF5A00] border-l-4 border-[#FF5A00]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className={`flex items-center justify-center w-6 h-6 flex-shrink-0 ${activeSidebarItem === item.id && !selectedBranchId ? "text-[#FF5A00]" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.id}</span>}
              </div>
            ))}
          </nav>

          {/* Bottom Collapse Button */}
          <div className={`mt-auto ${isSidebarCollapsed ? "p-4 px-2" : "p-4"}`}>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg border-none bg-[#FFF7F5] text-slate-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-orange-50"
            >
              <svg className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {!isSidebarCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (TOPBAR + CONTENT) */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* NEW NARROW TOPBAR */}
        <header className="h-[72px] bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50 sticky top-0">
          <div className="flex items-center"></div>

          {/* PERFECTLY CENTERED TITLE */}
          <div className="absolute left-1/2 -translate-x-1/2 font-semibold text-slate-900 text-lg">
            Admin Console
          </div>

          <div className="flex items-center">

            {/* PENDING REQUESTS BUTTON → links to dedicated page */}
            {role === "ADMIN" && (
              <div className="mr-4">
                <button
                  onClick={() => navigate("/admin/pending-requests")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold cursor-pointer transition-all duration-200 shadow-sm hover:bg-slate-50"
                >
                  <Icons.Users />
                  Pending Requests
                  {pendingStores.length > 0 && (
                    <span className="bg-[#FF5A00] text-white text-xs font-extrabold px-2 py-0.5 rounded-full ml-1">
                      {pendingStores.length}
                    </span>
                  )}
                </button>
              </div>
            )}


            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-slate-200"
              >
                <Icons.User />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute top-[120%] right-0 w-[220px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-[100]">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <div className="font-semibold text-slate-900 text-sm">{user?.name || "User"}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{user?.email || ""}</div>
                    <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">{role}</div>
                  </div>
                  <div className="h-px bg-slate-100 italic"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-3 px-4 border-none bg-white text-red-500 text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50"
                  >
                    <Icons.Logout />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN WORKING AREA */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden text-slate-900 bg-slate-50">
          {selectedBranchId ? renderBranchDetail() : (
            activeSidebarItem === "Dashboard" ? renderDashboardGlobal() :
              activeSidebarItem === "Branches" ? renderBranchesList() :
                activeSidebarItem === "Menu" ? renderMenuManagement() :
                  activeSidebarItem === "Analytics" ? renderAnalytics() :
                    activeSidebarItem === "Settings" ? renderSettings() :
                      <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-500 text-base text-center font-medium">Module '{activeSidebarItem}' is under development.</div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </div>
  );
}
