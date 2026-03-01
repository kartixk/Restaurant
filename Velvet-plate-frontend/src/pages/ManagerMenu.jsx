// src/pages/ManagerMenu.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Search, Filter } from "lucide-react";
import "./ManagerMenu.css";

export default function ManagerMenu() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await api.get("/products/my-branch-products");
                setProducts(res.data || []);
            } catch (err) {
                // Ignore 404 for new managers
                if (err.response?.status === 404) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }

                // Falling back to generic fetch if needed
                try {
                    const branchRes = await api.get("/branches/my-branch");
                    const menuRes = await api.get(`/products?branchId=${branchRes.data.id}`);
                    setProducts(menuRes.data || []);
                } catch (e) {
                    if (e.response?.status !== 404) {
                        toast.error("Failed to load menu");
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const formatCurrency = (val) => `₹${val.toFixed(0)}`;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ManagerLayout title="Menu Management" subtitle="Manage your restaurant's digital menu and stock availability.">
            <div className="manager-menu-container">
                <div style={{ display: 'flex', gap: '1rem', mb: '1rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search items or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>
                    <button className="manager-menu-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Add New Item
                    </button>
                </div>

                <div className="manager-menu-card">
                    <div className="manager-menu-header">
                        <h3 className="manager-menu-title">Menu Repository ({filteredProducts.length})</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button style={{ padding: '0.5rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px' }}><Filter size={16} /></button>
                        </div>
                    </div>

                    <table className="manager-menu-table">
                        <thead>
                            <tr>
                                <th className="manager-menu-th">Item Name</th>
                                <th className="manager-menu-th">Category</th>
                                <th className="manager-menu-th">Price</th>
                                <th className="manager-menu-th">Stock</th>
                                <th className="manager-menu-th">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading menu items...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No items found.</td></tr>
                            ) : filteredProducts.map((p) => (
                                <tr key={p._id}>
                                    <td className="manager-menu-td" style={{ fontWeight: 600 }}>{p.name}</td>
                                    <td className="manager-menu-td"><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{p.category}</span></td>
                                    <td className="manager-menu-td" style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                                    <td className="manager-menu-td">
                                        <span className={`stock-badge ${p.quantity > 5 ? 'stock-high' : 'stock-low'}`}>
                                            {p.quantity} Unit(s)
                                        </span>
                                    </td>
                                    <td className="manager-menu-td">
                                        <label className="switch">
                                            <input type="checkbox" checked={p.quantity > 0} readOnly />
                                            <span className="slider"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ManagerLayout>
    );
}
