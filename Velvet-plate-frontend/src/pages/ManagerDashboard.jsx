// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import {
    LineChart, Line, PieChart, Pie, Cell, Legend,
    ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { toast } from "react-toastify";
import { TrendingUp, ShoppingBag, IndianRupee, BarChart2 } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const STAT_CONFIG = [
    { key: "gross", label: "Gross Revenue", icon: IndianRupee, gradient: "linear-gradient(135deg,#f97316,#ef4444)", bg: "#fff7ed", iconBg: "rgba(249,115,22,0.12)", iconColor: "#ea580c", border: "rgba(249,115,22,0.15)" },
    { key: "fee", label: "Platform Fee (15%)", icon: BarChart2, gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", bg: "#f5f3ff", iconBg: "rgba(139,92,246,0.12)", iconColor: "#7c3aed", border: "rgba(139,92,246,0.15)" },
    { key: "orders", label: "Completed Orders", icon: ShoppingBag, gradient: "linear-gradient(135deg,#10b981,#059669)", bg: "#f0fdf4", iconBg: "rgba(16,185,129,0.12)", iconColor: "#059669", border: "rgba(16,185,129,0.15)" },
    { key: "avg", label: "Avg. Order Value", icon: TrendingUp, gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", bg: "#eff6ff", iconBg: "rgba(59,130,246,0.12)", iconColor: "#2563eb", border: "rgba(59,130,246,0.15)" },
];

function StatCard({ config, value }) {
    const Icon = config.icon;
    return (
        <div
            className="relative overflow-hidden"
            style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
                boxSizing: "border-box",
            }}
        >
            {/* Top gradient accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: config.gradient, borderRadius: "20px 20px 0 0" }} />

            <div className="flex items-start justify-between mb-4">
                <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{ width: "48px", height: "48px", background: config.iconBg }}
                >
                    <Icon size={22} style={{ color: config.iconColor }} strokeWidth={2} />
                </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">{config.label}</p>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tighter leading-none">{value}</div>
        </div>
    );
}

export default function ManagerDashboard() {
    const [data, setData] = useState({ sales: [], summary: { totalAmount: 0, count: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/reports/branch-sales?type=month");
                setData({
                    sales: res.data?.sales || [],
                    summary: { totalAmount: res.data?.totalAmount || 0, count: res.data?.count || 0 }
                });
            } catch (err) {
                if (err.response?.status !== 404) toast.error("Failed to load analytics");
                setData({ sales: [], summary: { totalAmount: 0, count: 0 } });
            } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const chartData = (() => {
        if (!data.sales?.length) return Array.from({ length: 7 }).map((_, i) => ({ date: `Day ${i + 1}`, revenue: 0 }));
        const groups = {};
        data.sales.forEach(s => {
            const d = new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            groups[d] = (groups[d] || 0) + (Number(s.orderTotal) || 0);
        });
        return Object.entries(groups).slice(-7).map(([date, revenue]) => ({ date, revenue }));
    })();

    const pieData = (() => {
        if (!data.sales?.length) return [{ name: "No Data", value: 1, color: "#e2e8f0" }];
        const types = { DINE_IN: 0, TAKEAWAY: 0 };
        data.sales.forEach(s => { const t = (s.orderType || "DINE_IN").toUpperCase(); if (types[t] !== undefined) types[t]++; });
        return [
            { name: "Dine-in", value: types.DINE_IN, color: "#f97316" },
            { name: "Takeaway", value: types.TAKEAWAY, color: "#10b981" },
        ].filter(i => i.value > 0);
    })();

    const gross = data.summary.totalAmount;
    const avgTicket = data.summary.count > 0 ? gross / data.summary.count : 0;

    const stats = [
        { config: STAT_CONFIG[0], value: fmt(gross) },
        { config: STAT_CONFIG[1], value: fmt(gross * 0.15) },
        { config: STAT_CONFIG[2], value: data.summary.count },
        { config: STAT_CONFIG[3], value: fmt(avgTicket) },
    ];

    return (
        <ManagerLayout>
            <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "40px", boxSizing: "border-box" }}>

                {/* Page heading */}
                <div className="mb-10">
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Dashboard Overview</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time analytics and revenue monitoring for your branch.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid gap-5 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    {stats.map(({ config, value }) => (
                        <StatCard key={config.key} config={config} value={value} />
                    ))}
                </div>

                {/* Charts */}
                <div className="grid gap-5 mb-6" style={{ gridTemplateColumns: "2fr 1fr" }}>

                    {/* Revenue Line Chart */}
                    <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <h2 className="text-base font-bold text-slate-900 m-0">Revenue Last 30 Days</h2>
                                <p className="text-slate-400 text-xs font-medium mt-0.5">Daily revenue trend</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "rgba(249,115,22,0.08)", color: "#ea580c" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Live
                            </div>
                        </div>
                        <div style={{ padding: "24px", height: "280px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <defs>
                                        <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontSize: "13px" }}
                                        formatter={(v) => [fmt(v), "Revenue"]}
                                        labelStyle={{ color: "#64748b", fontWeight: 600 }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Distribution */}
                    <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f8fafc" }}>
                            <h2 className="text-base font-bold text-slate-900 m-0">Order Distribution</h2>
                            <p className="text-slate-400 text-xs font-medium mt-0.5">By type breakdown</p>
                        </div>
                        <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "center", height: "280px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: 600, paddingTop: "8px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}
