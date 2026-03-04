import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
};

export default function AddProductForm({
    handleAddProduct,
    newProduct,
    handleChange,
    categories,
    branches = [],
    role
}) {
    return (
        <motion.div
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col"
            variants={cardVariants}
        >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-medium text-slate-500">✨ Add Menu Item</h3>
            </div>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600 block">Item Name</label>
                    <input
                        name="name"
                        placeholder="e.g. Grilled Chicken"
                        value={newProduct.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600 block">Category</label>
                    <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500 bg-white cursor-pointer"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600 block">Diet Type</label>
                    <select
                        name="dietType"
                        value={newProduct.dietType || "Veg"}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500 bg-white cursor-pointer"
                    >
                        <option value="Veg">Veg</option>
                        <option value="Non-Veg">Non-Veg</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Egg">contains Egg</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-600 block">Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        placeholder="0"
                        value={newProduct.price}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500"
                    />
                </div>

                {role === "ADMIN" && (
                    <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-sm font-semibold text-slate-600 block">Branch</label>
                        <select
                            name="branchId"
                            value={newProduct.branchId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500 bg-white cursor-pointer"
                        >
                            <option value="">Global (All Branches)</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.name} ({b.location})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-sm font-semibold text-slate-600 block">Image URL</label>
                    <div className="flex gap-2 items-center">
                        <input
                            name="imageUrl"
                            placeholder="https://..."
                            value={newProduct.imageUrl}
                            onChange={handleChange}
                            className="w-full flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none transition-colors focus:border-orange-500"
                            required
                        />
                        {newProduct.imageUrl && (
                            <img
                                src={newProduct.imageUrl}
                                alt="Preview"
                                className="w-10 h-10 object-cover rounded-md border border-slate-200"
                                onError={(e) => { e.target.src = 'https://placehold.co/40x40/f8fafc/64748b?text=Error'; }}
                            />
                        )}
                    </div>
                </div>
                <motion.button
                    type="submit"
                    className="w-full py-3 bg-[#FF5A00] text-white rounded-lg text-base font-bold mt-2 transition-all shadow-orange-500/20 shadow-lg"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(255, 90, 0, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                >
                    Add to Menu
                </motion.button>
            </form>
        </motion.div>
    );
}
