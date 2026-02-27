import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Store, LayoutDashboard, UtensilsCrossed, ClipboardList, Wallet, Settings,
    LogOut, UploadCloud, MapPin, Building, CreditCard, Clock, FileText, CheckCircle,
    AlertCircle, ChevronRight, Eye, Play, StopCircle, RefreshCw, BarChart2, PieChart as PieChartIcon
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── UTILS ──────────────────────────────────────────────────────────────────
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

// ─── STYLES (Professional SaaS, Tailwind-like, Slate-50) ────────────────────
const S = {
    layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "260px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", flexShrink: 0 },
    sidebarHeader: { padding: "1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "0.75rem" },
    logoIcon: { width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", boxShadow: "0 4px 6px -1px rgba(234, 88, 12, 0.3)" },
    sidebarNav: { padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 },
    navItem: (isActive) => ({ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", cursor: "pointer", backgroundColor: isActive ? "#f1f5f9" : "transparent", color: isActive ? "#0f172a" : "#64748b", fontWeight: isActive ? 600 : 500, transition: "all 0.2s" }),
    mainArea: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" },
    topbar: { height: "70px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", flexShrink: 0 },
    content: { padding: "2rem", maxWidth: "1280px", margin: "0 auto", width: "100%", boxSizing: "border-box" },
    pageTitle: { fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.5px" },
    pageSubtitle: { fontSize: "0.875rem", color: "#64748b", margin: 0 },
    card: { backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)", overflow: "hidden" },
    cardHeader: { padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: 0 },
    cardBody: { padding: "1.5rem" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" },
    inputGroup: { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" },
    label: { fontSize: "0.875rem", fontWeight: 500, color: "#475569" },
    input: { width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", fontSize: "0.875rem", color: "#0f172a", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
    btnPrimary: { padding: "0.75rem 1.5rem", borderRadius: "8px", background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", color: "#ffffff", border: "none", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: "0 4px 6px -1px rgba(234, 88, 12, 0.2)" },
    btnOutline: { padding: "0.75rem 1.5rem", borderRadius: "8px", backgroundColor: "transparent", color: "#475569", border: "1px solid #cbd5e1", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" },
    badge: (colorBg, colorText) => ({ padding: "4px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: colorBg, color: colorText }),
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
    td: { padding: "1rem 1.5rem", fontSize: "0.875rem", color: "#0f172a", borderBottom: "1px solid #e2e8f0" }
};

// ─── ONBOARDING COMPONENT ───────────────────────────────────────────────────
function ManagerOnboarding({ onComplete }) {
    const [formData, setFormData] = useState({
        name: "", branchName: "", phone: "",
        address: "", city: "", state: "", pincode: "",
        gstNumber: "", fssaiLicense: "",
        bankAccountName: "", bankAccountNumber: "", bankIfscCode: "",
        openTime: "10:00", closeTime: "22:00"
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/branches/onboard", formData);
            toast.success("Store details submitted for review!");
            onComplete();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit store details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div style={{ ...S.layout, justifyContent: "center", alignItems: "flex-start", padding: "4rem 1rem" }}>
            <div style={{ ...S.card, width: "100%", maxWidth: "800px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
                <div style={{ backgroundColor: "#f8fafc", padding: "2rem", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                    <div style={{ ...S.logoIcon, margin: "0 auto 1rem auto", width: "48px", height: "48px", fontSize: "1.5rem" }}>🏪</div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0" }}>Partner Onboarding</h1>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Complete your store profile to activate your restaurant.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1.5rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}><Building size={18} /> Basic Information</h3>
                    <div style={S.grid2}>
                        <div style={S.inputGroup}><label style={S.label}>Restaurant Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>Branch Area *</label><input type="text" name="branchName" value={formData.branchName} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>Contact Phone *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={S.input} required /></div>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "2.5rem 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}><MapPin size={18} /> Location Details</h3>
                    <div style={S.inputGroup}><label style={S.label}>Full Address *</label><input type="text" name="address" value={formData.address} onChange={handleChange} style={S.input} required /></div>
                    <div style={{ ...S.grid2, gridTemplateColumns: "1fr 1fr 1fr" }}>
                        <div style={S.inputGroup}><label style={S.label}>City *</label><input type="text" name="city" value={formData.city} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>State *</label><input type="text" name="state" value={formData.state} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>Pincode *</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={S.input} required /></div>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "2.5rem 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}><RefreshCw size={18} /> Operational Hours</h3>
                    <div style={S.grid2}>
                        <div style={S.inputGroup}><label style={S.label}>Opening Time *</label><input type="time" name="openTime" value={formData.openTime} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>Closing Time *</label><input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} style={S.input} required /></div>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "2.5rem 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}><FileText size={18} /> Legal & Compliance</h3>
                    <div style={S.grid2}>
                        <div style={S.inputGroup}><label style={S.label}>GST Number (Optional)</label><input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} style={S.input} /></div>
                        <div style={S.inputGroup}><label style={S.label}>FSSAI License Number *</label><input type="text" name="fssaiLicense" value={formData.fssaiLicense} onChange={handleChange} style={S.input} required /></div>
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: "2.5rem 0 1.5rem 0", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}><CreditCard size={18} /> Bank Details (For Payouts)</h3>
                    <div style={S.inputGroup}><label style={S.label}>Bank Account Name *</label><input type="text" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} style={S.input} required /></div>
                    <div style={S.grid2}>
                        <div style={S.inputGroup}><label style={S.label}>Account Number *</label><input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} style={S.input} required /></div>
                        <div style={S.inputGroup}><label style={S.label}>IFSC Code *</label><input type="text" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} style={S.input} required /></div>
                    </div>

                    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                        <button type="submit" disabled={loading} style={{ ...S.btnPrimary, width: "100%", maxWidth: "300px", padding: "1rem" }}>
                            {loading ? "Submitting..." : "Submit for Verification"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── WAITING SCREEN COMPONENT ───────────────────────────────────────────────
function ManagerUnderReview({ logout }) {
    return (
        <div style={{ ...S.layout, justifyContent: "center", alignItems: "center", padding: "2rem" }}>
            <div style={{ ...S.card, maxWidth: "500px", width: "100%", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#fffbeb", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "2.5rem" }}>
                    <Clock size={40} />
                </div>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#0f172a" }}>Verification in Progress</h1>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Your store profile has been successfully submitted and is currently <strong>Under Review</strong> by our team.
                        We will review your FSSAI and Bank Details shortly. Once approved, you will gain full access to the Partner Dashboard.
                    </p>
                </div>
                <div style={{ marginTop: "1.5rem" }}>
                    <button onClick={() => { logout(); window.location.href = '/login'; }} style={{ ...S.btnOutline, margin: "0 auto", color: "#ef4444", borderColor: "#fca5a5" }}>Logout securely</button>
                </div>
            </div>
        </div>
    );
}

// ─── FULL PARTNER DASHBOARD COMPONENT ───────────────────────────────────────
function ManagerDashboard({ branch, logout }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [dashboardData, setDashboardData] = useState({ products: [], sales: [], summary: { totalAmount: 0, count: 0 } });
    const [visibility, setVisibility] = useState(branch.isVisible);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [prodRes, salesRes] = await Promise.all([
                    api.get(`/products?branchId=${branch.id}`),
                    api.get(`/reports/branch-sales?type=month&branchId=${branch.id}`)
                ]);
                const salesData = Array.isArray(salesRes.data) ? (salesRes.data[0] || {}) : salesRes.data;
                setDashboardData({
                    products: prodRes.data,
                    sales: salesData.sales || [],
                    summary: { totalAmount: salesData.totalAmount || 0, count: salesData.count || 0 }
                });
            } catch (err) {
                toast.error("Failed to sync dashboard data.");
            }
        };
        fetchDashboardData();
    }, [branch.id]);

    const handleToggleVisibility = async () => {
        try {
            const res = await api.put(`/branches/${branch.id}/visibility`, { isVisible: !visibility });
            setVisibility(res.data.isVisible);
            toast.success(`Store is now ${res.data.isVisible ? 'Visible' : 'Hidden'}`);
        } catch (err) {
            toast.error("Failed to toggle visibility");
        }
    };

    // Mock data calculations for realistic feel based on real sales list
    const { sales, products, summary } = dashboardData;
    const recentOrders = sales.slice(0, 5);
    const chartData = Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, revenue: Math.floor(Math.random() * 5000) + 1000, orders: Math.floor(Math.random() * 20) + 5 }));
    const pieData = [{ name: 'Dine-in', value: 45, color: '#f59e0b' }, { name: 'Delivery', value: 35, color: '#3b82f6' }, { name: 'Takeaway', value: 20, color: '#10b981' }];

    const renderOverview = () => (
        <div style={{ padding: "0" }}>
            <div style={S.grid4}>
                {[
                    { label: "Today's Revenue", val: formatCurrency(summary.totalAmount * 0.05 + 1200), trend: "+12.5%", pos: true },
                    { label: "Today's Orders", val: Math.floor(summary.count * 0.05 + 12), trend: "+5.2%", pos: true },
                    { label: "Monthly Revenue", val: formatCurrency(summary.totalAmount), trend: "-2.1%", pos: false },
                    { label: "Avg Order Value", val: formatCurrency(summary.totalAmount / (summary.count || 1)), trend: "+1.5%", pos: true },
                ].map((s, i) => (
                    <div key={i} style={{ ...S.card, padding: "1.5rem" }}>
                        <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.875rem", fontWeight: 500 }}>{s.label}</p>
                        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem", color: "#0f172a" }}>{s.val}</h3>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: s.pos ? "#059669" : "#dc2626", backgroundColor: s.pos ? "#ecfdf5" : "#fef2f2", padding: "2px 6px", borderRadius: "4px" }}>
                            {s.pos ? '↑' : '↓'} {s.trend} from last period
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ ...S.grid2, marginTop: "1.5rem" }}>
                <div style={S.card}>
                    <div style={S.cardHeader}><h3 style={S.cardTitle}>Revenue & Orders (7 Days)</h3></div>
                    <div style={{ height: "300px", padding: "1.5rem" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={v => `₹${v / 1000}k`} dx={-10} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dx={10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={S.card}>
                    <div style={S.cardHeader}><h3 style={S.cardTitle}>Sales Distribution</h3></div>
                    <div style={{ height: "300px", padding: "1.5rem" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val) => `${val}%`} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem', color: "#64748b" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ ...S.card, marginTop: "1.5rem" }}>
                <div style={S.cardHeader}><h3 style={S.cardTitle}>Recent Actionable Orders</h3></div>
                <table style={S.table}>
                    <thead><tr><th style={S.th}>Order ID</th><th style={S.th}>Time</th><th style={S.th}>Amount</th><th style={S.th}>Status</th><th style={S.th}>Action</th></tr></thead>
                    <tbody>
                        {recentOrders.length === 0 ? <tr><td colSpan="5" style={{ ...S.td, textAlign: "center", color: "#64748b" }}>No recent orders.</td></tr> : recentOrders.map((o, i) => (
                            <tr key={i}>
                                <td style={{ ...S.td, fontWeight: 500 }}>#{o.id.substring(o.id.length - 6).toUpperCase()}</td>
                                <td style={S.td}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td style={{ ...S.td, fontWeight: 600 }}>{formatCurrency(o.orderTotal)}</td>
                                <td style={S.td}><span style={S.badge("#fef3c7", "#d97706")}>{o.status || 'PREPARING'}</span></td>
                                <td style={S.td}><button style={{ ...S.btnOutline, padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}>View</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMyStore = () => (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ ...S.card, marginBottom: "1.5rem" }}>
                <div style={S.cardHeader}>
                    <h3 style={S.cardTitle}>Store Visibility Configuration</h3>
                    <span style={S.badge(branch.storeStatus === 'verified' ? "#ecfdf5" : "#fffbeb", branch.storeStatus === 'verified' ? "#059669" : "#b45309")}>
                        {branch.storeStatus.toUpperCase()}
                    </span>
                </div>
                <div style={{ ...S.cardBody, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h4 style={{ margin: "0 0 0.25rem 0", color: "#0f172a" }}>Customer Visibility</h4>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>Turn off to temporarily hide your store from customers (e.g., during rush hours).</p>
                    </div>
                    <button onClick={handleToggleVisibility} style={visibility ? { ...S.btnPrimary, background: "#10b981", boxShadow: "none" } : { ...S.btnOutline, color: "#dc2626", borderColor: "#fca5a5", background: "#fef2f2" }}>
                        {visibility ? <><CheckCircle size={18} /> Store Active</> : <><StopCircle size={18} /> Store Hidden</>}
                    </button>
                </div>
            </div>

            <div style={S.card}>
                <div style={S.cardHeader}><h3 style={S.cardTitle}>Store Details (Read-Only)</h3></div>
                <div style={{ ...S.cardBody, display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={S.grid2}>
                        <div><p style={S.label}>Restaurant Name</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.name}</p></div>
                        <div><p style={S.label}>Branch Area</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.branchName || branch.city}</p></div>
                        <div><p style={S.label}>Operating Hours</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.openTime || "10:00"} - {branch.closeTime || "22:00"}</p></div>
                        <div><p style={S.label}>Contact Phone</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.phone}</p></div>
                    </div>
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
                        <p style={S.label}>Full Address</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.address}, {branch.city}, {branch.state} {branch.pincode}</p>
                    </div>
                    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0", ...S.grid2 }}>
                        <div><p style={S.label}>FSSAI License</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.fssaiLicense || "N/A"}</p></div>
                        <div><p style={S.label}>GST Number</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.gstNumber || "N/A"}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMenu = () => (
        <div style={S.card}>
            <div style={{ ...S.cardHeader, borderBottom: "1px solid #e2e8f0" }}>
                <h3 style={S.cardTitle}>Menu Repository</h3>
                <button style={S.btnPrimary}>+ Add New Item</button>
            </div>
            <table style={S.table}>
                <thead><tr><th style={S.th}>Item Name</th><th style={S.th}>Category</th><th style={S.th}>Price</th><th style={S.th}>Stock</th><th style={S.th}>Visibility</th></tr></thead>
                <tbody>
                    {products.length === 0 ? <tr><td colSpan="5" style={{ ...S.td, textAlign: "center", color: "#64748b", padding: "3rem" }}>No items in menu yet.</td></tr> : products.map(p => (
                        <tr key={p.id}>
                            <td style={{ ...S.td, fontWeight: 500 }}>{p.name}</td>
                            <td style={S.td}><span style={S.badge("#f1f5f9", "#475569")}>{p.category}</span></td>
                            <td style={{ ...S.td, fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                            <td style={S.td}>{p.quantity > 5 ? <span style={{ color: "#059669", fontWeight: 500 }}>{p.quantity} Unit(s)</span> : <span style={{ color: "#dc2626", fontWeight: 600 }}>{p.quantity} Unit(s)</span>}</td>
                            <td style={S.td}>
                                <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                                    <input type="checkbox" checked={p.quantity > 0} readOnly style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: p.quantity > 0 ? '#10b981' : '#cbd5e1', borderRadius: '34px', transition: '.4s' }}>
                                        <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: p.quantity > 0 ? '18px' : '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s' }}></span>
                                    </span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderOrders = () => {
        const buckets = ["ACTIVE", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
        // Mock distributing the actual sales data across buckets
        return (
            <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", minHeight: "600px" }}>
                {buckets.map(b => (
                    <div key={b} style={{ minWidth: "280px", backgroundColor: "#f1f5f9", borderRadius: "12px", padding: "1rem", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "0.5rem", borderBottom: "2px solid #cbd5e1" }}>
                            {b} <span style={{ float: 'right', backgroundColor: "#cbd5e1", color: "#475569", padding: "2px 6px", borderRadius: "100px", fontSize: "0.7rem" }}>0</span>
                        </h4>
                        {b === "COMPLETED" && recentOrders.length > 0 && recentOrders.map((o, i) => (
                            <div key={i} style={{ ...S.card, padding: "1rem", borderLeft: "3px solid #10b981", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>#{o.id.substring(o.id.length - 6).toUpperCase()}</span>
                                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.5rem" }}>{o.items.length} Items • {formatCurrency(o.orderTotal)}</div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button style={{ ...S.btnOutline, width: "100%", padding: "0.25rem", fontSize: "0.75rem", background: "#f8fafc" }}>View Details</button>
                                </div>
                            </div>
                        ))}
                        {b !== "COMPLETED" && <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8", fontSize: "0.875rem" }}>No orders</div>}
                    </div>
                ))}
            </div>
        );
    };

    const renderPayouts = () => (
        <div style={{ maxWidth: "800px" }}>
            <div style={S.grid2}>
                <div style={{ ...S.card, padding: "2rem", borderTop: "4px solid #10b981" }}>
                    <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontWeight: 500 }}>Available Payout</p>
                    <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "2.5rem", color: "#0f172a" }}>{formatCurrency(summary.totalAmount * 0.85)}</h2>
                    <button style={S.btnPrimary}>Request Payout</button>
                    <p style={{ margin: "1rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>* After 15% platform commission deduction</p>
                </div>
                <div style={S.card}>
                    <div style={S.cardHeader}><h3 style={S.cardTitle}>Settlement Bank Account</h3></div>
                    <div style={{ ...S.cardBody, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div><p style={S.label}>Account Holder</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.bankAccountName || "N/A"}</p></div>
                        <div><p style={S.label}>Account Number</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>•••• •••• {branch.bankAccountNumber ? branch.bankAccountNumber.slice(-4) : "XXXX"}</p></div>
                        <div><p style={S.label}>IFSC Code</p><p style={{ margin: "0.25rem 0 0 0", fontWeight: 500 }}>{branch.bankIfscCode || "N/A"}</p></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={S.layout}>
            <aside style={S.sidebar}>
                <div style={S.sidebarHeader}>
                    <div style={S.logoIcon}>F</div>
                    <div>
                        <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "block", lineHeight: 1 }}>FoodFlow</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#f59e0b", letterSpacing: "1px", textTransform: "uppercase" }}>Partner Center</span>
                    </div>
                </div>
                <nav style={S.sidebarNav}>
                    <div style={S.navItem(activeTab === "overview")} onClick={() => setActiveTab("overview")}><LayoutDashboard size={18} /> Overview</div>
                    <div style={S.navItem(activeTab === "mystore")} onClick={() => setActiveTab("mystore")}><Store size={18} /> My Store</div>
                    <div style={S.navItem(activeTab === "menu")} onClick={() => setActiveTab("menu")}><UtensilsCrossed size={18} /> Menu Management</div>
                    <div style={S.navItem(activeTab === "orders")} onClick={() => setActiveTab("orders")}><ClipboardList size={18} /> Orders</div>
                    <div style={S.navItem(activeTab === "payouts")} onClick={() => setActiveTab("payouts")}><Wallet size={18} /> Payouts</div>
                    <div style={S.navItem(activeTab === "settings")} onClick={() => setActiveTab("settings")}><Settings size={18} /> Settings</div>
                </nav>
                <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ ...S.navItem(false), color: "#ef4444", padding: "0.5rem" }} onClick={() => { logout(); window.location.href = '/login'; }}><LogOut size={18} /> Logout</div>
                </div>
            </aside>

            <div style={S.mainArea}>
                <header style={S.topbar}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#0f172a" }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span style={S.badge(visibility ? "#ecfdf5" : "#fef2f2", visibility ? "#059669" : "#dc2626")}>{visibility ? '🏪 Store Visible' : '⏸ Store Hidden'}</span>
                        <div style={{ height: "32px", width: "1px", backgroundColor: "#e2e8f0" }}></div>
                        <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{branch.name}</div>
                    </div>
                </header>
                <div style={S.content}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h1 style={S.pageTitle}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <p style={S.pageSubtitle}>Manage your restaurant's {activeTab} details and settings.</p>
                    </div>
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "mystore" && renderMyStore()}
                    {activeTab === "menu" && renderMenu()}
                    {activeTab === "orders" && renderOrders()}
                    {activeTab === "payouts" && renderPayouts()}
                    {activeTab === "settings" && <div style={S.card}><div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>Settings module is under construction.</div></div>}
                </div>
            </div>
        </div>
    );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
export default function Manager() {
    const { user, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [triggerRefresh, setTriggerRefresh] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        const fetchMyBranch = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                setBranch(res.data);
            } catch (err) {
                if (err.response?.status !== 404) toast.error("Failed to load your branch data.");
            } finally { setLoading(false); }
        };
        fetchMyBranch();
    }, [isAuthenticated, navigate, triggerRefresh]);

    if (loading) return <div style={{ ...S.layout, alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#475569" }}>Initializing Partner Console...</div>;

    if (!branch || branch.storeStatus === "pending") {
        return (
            <>
                <ToastContainer position="top-right" autoClose={3000} theme="colored" />
                <ManagerOnboarding onComplete={() => setTriggerRefresh(prev => prev + 1)} />
            </>
        );
    }

    if (branch.storeStatus === "under_review") {
        return <ManagerUnderReview logout={logout} />;
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <ManagerDashboard branch={branch} logout={logout} />
        </>
    );
}
