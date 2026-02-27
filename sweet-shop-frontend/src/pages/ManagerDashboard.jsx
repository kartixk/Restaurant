// src/pages/ManagerDashboard.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import {
    LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,

    PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "react-toastify";

export default function ManagerDashboard() {
    const [data, setData] = useState({ sales: [], summary: { totalAmount: 0, count: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/reports/branch-sales?type=month");
                setData({
                    sales: res.data?.sales || [],
                    summary: {
                        totalAmount: res.data?.totalAmount || 0,
                        count: res.data?.count || 0
                    }
                });
            } catch (err) {
                // Ignore 404 for new managers
                if (err.response?.status !== 404) {
                    toast.error("Failed to load analytics");
                }
                setData({ sales: [], summary: { totalAmount: 0, count: 0 } });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Process data for the line chart (Revenue Trends)
    // Grouping by date for the last 7 days or similar
    const getChartData = () => {
        if (!data.sales || data.sales.length === 0) return [];

        const groups = {};
        data.sales.forEach(sale => {
            const date = new Date(sale.createdAt).toLocaleDateString();
            groups[date] = (groups[date] || 0) + (Number(sale.orderTotal) || 0);
        });

        return Object.entries(groups).map(([date, revenue]) => ({
            date,
            revenue
        })).slice(-7); // Last 7 unique days found
    };

    // Process data for Order Distribution (by Type)
    const getPieData = () => {
        if (!data.sales || data.sales.length === 0) return [
            { name: 'No Data', value: 1, color: '#e2e8f0' }
        ];

        const types = { 'DINE_IN': 0, 'TAKEAWAY': 0, 'DELIVERY': 0 };
        data.sales.forEach(sale => {
            const t = (sale.orderType || 'DINE_IN').toUpperCase();
            types[t] = (types[t] || 0) + 1;
        });

        return [
            { name: 'Dine-in', value: types.DINE_IN, color: '#f59e0b' },
            { name: 'Takeaway', value: types.TAKEAWAY, color: '#10b981' },
            { name: 'Delivery', value: types.DELIVERY, color: '#3b82f6' }
        ].filter(item => item.value > 0);
    };

    const chartData = getChartData();
    const pieData = getPieData();

    return (
        <ManagerLayout title="Dashboard" subtitle="Overview of your restaurant's performance.">
            <div className="manager-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: "Total Revenue", val: `₹${data.summary.totalAmount.toLocaleString('en-IN')}`, trend: "Lifetime" },
                    { label: "Commission (15%)", val: `₹${(data.summary.totalAmount * 0.15).toLocaleString('en-IN')}`, trend: "Deducted" },
                    { label: "Total Orders", val: data.summary.count, trend: "Completed" },
                    { label: "Avg Ticket", val: `₹${(data.summary.totalAmount / (data.summary.count || 1)).toFixed(0)}`, trend: "Per Order" },
                ].map((s, i) => (
                    <div key={i} className="manager-stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{s.label}</p>
                        <h2 style={{ margin: '0.5rem 0', fontSize: '1.75rem' }}>{s.val}</h2>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{s.trend}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Revenue Trends</h3>
                    {chartData.length > 0 ? (
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={true} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No sales data available for trends.</div>
                    )}
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0' }}>Order Distribution</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </ManagerLayout>
    );
}
