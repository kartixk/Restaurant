// src/pages/ManagerMenu.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Search, Filter, X, UtensilsCrossed } from "lucide-react";
import AddProductForm from "../components/features/admin/AddProductForm";

export default function ManagerMenu() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", dietType: "", imageUrl: "", branchId: "" });
    const categories = ["Starters", "Soups", "Main Course", "Breads/Rotis", "Desserts", "Mocktails"];
    const [myBranchId, setMyBranchId] = useState(null);
    const [availabilityMutationLoading, setAvailabilityMutationLoading] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const branchRes = await api.get("/branches/my-branch");
                setMyBranchId(branchRes.data.id);
                const menuRes = await api.get(`/products?branchId=${branchRes.data.id}`);
                setProducts(menuRes.data || []);
            } catch (err) {
                if (err.response?.status !== 404) toast.error("Failed to load menu");
                setProducts([]);
            } finally { setLoading(false); }
        };
        fetchMenu();
    }, []);

    const toggleAvailability = async (productId, currentStatus) => {
        setAvailabilityMutationLoading(productId);
        try {
            await api.patch(`/products/${productId}/availability`, { isAvailable: !currentStatus });
            toast.success("Availability updated");
            const menuRes = await api.get(`/products?branchId=${myBranchId}`);
            setProducts(menuRes.data || []);
        } catch (err) { toast.error("Failed to update availability"); }
        finally { setAvailabilityMutationLoading(null); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const formattedName = newProduct.name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        try {
            await api.post("/products", { ...newProduct, name: formattedName, branchId: myBranchId });
            toast.success(`"${formattedName}" added!`);
            setIsAddModalOpen(false);
            setNewProduct({ name: "", price: "", category: "", dietType: "", imageUrl: "", branchId: "" });
            setLoading(true);
            const menuRes = await api.get(`/products?branchId=${myBranchId}`);
            setProducts(menuRes.data || []);
        } catch (err) { toast.error("Failed to add product"); }
        finally { setLoading(false); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const dietDotColor = (dt) => dt === 'Veg' ? '#22c55e' : dt === 'Non-Veg' ? '#ef4444' : dt === 'Dessert' ? '#ec4899' : '#f59e0b';

    return (
        <ManagerLayout>
            <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "40px", boxSizing: "border-box" }}>

                {/* Page Heading + Add Button */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Menu Management</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage your restaurant's digital menu and stock availability.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={{ background: "linear-gradient(135deg,#f97316,#ef4444)", border: "none", boxShadow: "0 4px 14px rgba(249,115,22,0.35)" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative" style={{ maxWidth: "380px" }}>
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search items or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px 10px 40px",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                                background: "white",
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color: "#0f172a",
                                outline: "none",
                                boxSizing: "border-box",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.1)"; }}
                            onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
                        />
                    </div>
                </div>

                {/* Table Card */}
                <div style={{ background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                    {/* Card header */}
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid #f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center rounded-xl" style={{ width: "32px", height: "32px", background: "rgba(249,115,22,0.1)" }}>
                                <UtensilsCrossed size={15} style={{ color: "#f97316" }} />
                            </div>
                            <span className="text-sm font-bold text-slate-900">Menu Items</span>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#64748b" }}>{filteredProducts.length}</span>
                        </div>
                        <button className="flex items-center justify-center rounded-xl transition-colors" style={{ width: "34px", height: "34px", background: "#f8fafc", border: "1px solid #f1f5f9", cursor: "pointer" }}>
                            <Filter size={14} style={{ color: "#94a3b8" }} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#fafafa" }}>
                                    {["Item", "Category", "Price", "Stock", "Availability"].map(h => (
                                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #f1f5f9" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px" }}>Loading menu...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "14px" }}>No items found.</td></tr>
                                ) : filteredProducts.map((p) => (
                                    <tr
                                        key={p._id || p.id}
                                        style={{ transition: "background 0.15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={p.imageUrl || 'https://placehold.co/44x44/f8fafc/94a3b8?text=🍽'}
                                                    alt={p.name}
                                                    style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "12px", border: "1px solid #f1f5f9", flexShrink: 0 }}
                                                    onError={(e) => { e.target.src = 'https://placehold.co/44x44/f8fafc/94a3b8?text=🍽'; }}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{p.name}</span>
                                                    {p.dietType && (
                                                        <span
                                                            className="flex items-center justify-center"
                                                            style={{ width: "14px", height: "14px", borderRadius: "3px", border: `1.5px solid ${dietDotColor(p.dietType)}`, background: "white" }}
                                                        >
                                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: dietDotColor(p.dietType), display: "block" }} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>{p.category}</span>
                                        </td>
                                        <td style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc", fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                                            ₹{Number(p.price).toFixed(0)}
                                        </td>
                                        <td style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
                                            <span style={{
                                                padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                                                ...(p.isAvailable ? { background: "#f0fdf4", color: "#16a34a" } : { background: "#fef2f2", color: "#dc2626" })
                                            }}>
                                                {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
                                            <label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                    checked={p.isAvailable}
                                                    onChange={() => toggleAvailability(p._id || p.id, p.isAvailable)}
                                                    disabled={availabilityMutationLoading === (p._id || p.id)}
                                                />
                                                <span style={{
                                                    position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                                    background: p.isAvailable ? "linear-gradient(135deg,#f97316,#ef4444)" : "#e2e8f0",
                                                    borderRadius: "11px", transition: "0.3s",
                                                    boxShadow: p.isAvailable ? "0 2px 8px rgba(249,115,22,0.35)" : "none",
                                                }}>
                                                    <span style={{
                                                        position: "absolute", height: "16px", width: "16px",
                                                        left: p.isAvailable ? "21px" : "3px", bottom: "3px",
                                                        backgroundColor: "white", borderRadius: "50%", transition: "0.3s",
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                                    }} />
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div
                    style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div
                        style={{ background: "white", borderRadius: "28px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 40px 80px -20px rgba(0,0,0,0.3)" }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", padding: "8px", background: "#f1f5f9", border: "none", borderRadius: "10px", cursor: "pointer", color: "#64748b", zIndex: 10 }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
                        >
                            <X size={18} />
                        </button>
                        <div style={{ padding: "8px" }}>
                            <AddProductForm
                                handleAddProduct={handleAddProduct}
                                newProduct={newProduct}
                                handleChange={(e) => setNewProduct({ ...newProduct, [e.target.name]: e.target.value })}
                                categories={categories}
                                role="MANAGER"
                            />
                        </div>
                    </div>
                </div>
            )}
        </ManagerLayout>
    );
}
