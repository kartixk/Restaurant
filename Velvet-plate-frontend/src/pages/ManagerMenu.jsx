// src/pages/ManagerMenu.jsx
import React, { useState, useEffect } from "react";
import ManagerLayout from "../components/ManagerLayout";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Plus, Search, Filter, X } from "lucide-react";
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
            } finally {
                setLoading(false);
            }
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
        } catch (err) {
            toast.error("Failed to update availability");
        } finally {
            setAvailabilityMutationLoading(null);
        }
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
        } catch (err) {
            toast.error("Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ManagerLayout>
            <div className="max-w-[1400px] w-full mx-auto py-12 px-10 box-border">
                {/* Page Heading + Add Button */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Menu Management</h1>
                        <p className="text-base text-slate-500 font-medium">Manage your restaurant's digital menu and stock availability.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF5A00] text-white text-sm font-bold cursor-pointer transition-all hover:opacity-90 shadow-sm"
                    >
                        + Add Item
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search items or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-[#FF5A00]/20 focus:border-[#FF5A00] transition-all text-sm font-medium"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900">Menu Items ({filteredProducts.length})</h3>
                        <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                            <Filter size={14} className="text-slate-500" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100 w-16">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Toggle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-16 text-slate-400 text-sm">Loading menu...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-16 text-slate-400 text-sm">No items found.</td></tr>
                                ) : filteredProducts.map((p) => (
                                    <tr key={p._id || p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <img
                                                src={p.imageUrl || 'https://placehold.co/40x40/f8fafc/64748b?text=Img'}
                                                alt={p.name}
                                                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                                onError={(e) => { e.target.src = 'https://placehold.co/40x40/f8fafc/64748b?text=Img'; }}
                                            />
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{p.name}</span>
                                                {p.dietType && (
                                                    <span className={`flex items-center justify-center w-3.5 h-3.5 border rounded-sm bg-white ${p.dietType === 'Veg' ? 'border-emerald-500' :
                                                            p.dietType === 'Non-Veg' ? 'border-red-500' :
                                                                p.dietType === 'Dessert' ? 'border-pink-500' :
                                                                    'border-amber-500'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${p.dietType === 'Veg' ? 'bg-emerald-500' :
                                                                p.dietType === 'Non-Veg' ? 'bg-red-500' :
                                                                    p.dietType === 'Dessert' ? 'bg-pink-500' :
                                                                        'bg-amber-500'
                                                            }`} />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50 text-sm font-bold text-slate-900">
                                            ₹{Number(p.price).toFixed(0)}
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${p.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 border-b border-slate-50">
                                            <label className="relative inline-block w-9 h-5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={p.isAvailable}
                                                    onChange={() => toggleAvailability(p._id || p.id, p.isAvailable)}
                                                    disabled={availabilityMutationLoading === (p._id || p.id)}
                                                />
                                                <div className="w-full h-full bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition-colors duration-200"></div>
                                                <div className="absolute left-[3px] top-[3px] bg-white w-3.5 h-3.5 rounded-full transition-transform duration-200 peer-checked:translate-x-4"></div>
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
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all z-10"
                        >
                            <X size={20} />
                        </button>
                        <div className="p-2">
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
