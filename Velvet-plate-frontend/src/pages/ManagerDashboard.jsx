// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import {
    LineChart, Line, PieChart, Pie, Cell, Legend,
    ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { toast } from "react-toastify";

// ─── STAT CARD (matches Admin exactly) ──────────────────────────────────────
function StatCard({ label, value, trend, isPositive }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm box-border">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tighter leading-none">{value}</div>
            {trend && (
                <div className={`text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center w-fit ${isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                    {isPositive ? '↑' : '↓'} {trend}
                </div>
            )}
        </div>
    );
}

const formatCurrency = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

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
        if (!data.sales?.length) return [{ name: "No Data", value: 1, color: "#f1f5f9" }];
        const types = { DINE_IN: 0, TAKEAWAY: 0 };
        data.sales.forEach(s => { const t = (s.orderType || "DINE_IN").toUpperCase(); if (types[t] !== undefined) types[t]++; });
        return [
            { name: "Dine-in", value: types.DINE_IN, color: "#FF5A00" },
            { name: "Takeaway", value: types.TAKEAWAY, color: "#10b981" },
        ].filter(i => i.value > 0);
    })();

    const avgTicket = data.summary.count > 0 ? data.summary.totalAmount / data.summary.count : 0;

    return (
        <ManagerLayout>
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">

                {/* Page heading */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Dashboard overview</h1>
                        <p className="text-base text-slate-500 font-medium">Real-time analytics and revenue monitoring.</p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mb-12">
                    <StatCard label="Gross Revenue" value={formatCurrency(data.summary.totalAmount)} />
                    <StatCard label="Platform Fee (15%)" value={formatCurrency(data.summary.totalAmount * 0.15)} />
                    <StatCard label="Completed Orders" value={data.summary.count} />
                    <StatCard label="Avg. Order Value" value={formatCurrency(avgTicket)} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Revenue Line Chart */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border lg:col-span-2">
                        <div className="p-6 border-b border-slate-50 box-border">
                            <h2 className="text-lg font-bold text-slate-900 m-0">Revenue Last 30 Days</h2>
                        </div>
                        <div className="px-6 pb-6 box-border">
                            <div className="h-[300px] min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                            formatter={(v) => formatCurrency(v)}
                                        />
                                        <Line type="monotone" dataKey="revenue" stroke="#FF5A00" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#FF5A00", stroke: "#fff", strokeWidth: 2 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Order Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm box-border">
                        <div className="p-6 border-b border-slate-50 box-border">
                            <h2 className="text-lg font-bold text-slate-900 m-0">Order Distribution</h2>
                        </div>
                        <div className="p-6 flex-1 flex items-center justify-center">
                            <div style={{ width: "100%", height: 240 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: 600 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}
