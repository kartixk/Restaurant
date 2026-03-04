import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Search } from 'lucide-react';

const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
};

const inventoryContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05
        }
    }
};

const inventoryItemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.98
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 18,
            mass: 0.6
        }
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    },
    hover: {
        scale: 1.02,
        y: -2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        zIndex: 10,
        transition: { duration: 0.2 }
    }
};

export default function ProductInventoryList({
    categories,
    inventoryCategory,
    setInventoryCategory,
    inventorySearch,
    setInventorySearch,
    filteredInventory,
    stockInputs,
    handleStockInputChange,
    adjustStock,
    saveStockUpdate,
    handleDeleteProduct
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [inventoryCategory, inventorySearch]);

    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
    const paginatedInventory = filteredInventory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <motion.div
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[500px]"
            variants={cardVariants}
        >
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h3 className="text-sm font-medium text-slate-500">📦 Menu Inventory</h3>
                <div className="relative flex items-center flex-1 min-w-[200px]">
                    <input
                        type="text"
                        id="inventorySearch"
                        name="inventorySearch"
                        placeholder="Search items..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-orange-500 transition-colors"
                    />
                    <Search className="absolute left-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* CATEGORY FILTER TABS */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-slate-100 scrollbar-hide">
                {["All", ...categories].map((cat) => (
                    <motion.button
                        key={cat}
                        onClick={() => setInventoryCategory(cat)}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold whitespace-nowrap transition-all ${inventoryCategory === cat
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                <motion.div
                    key={inventoryCategory}
                    variants={inventoryContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <AnimatePresence mode="popLayout">
                        {paginatedInventory.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-12 text-slate-400 text-sm"
                            >
                                <p>No items found.</p>
                            </motion.div>
                        ) : (
                            paginatedInventory.map((s) => (
                                <motion.div
                                    key={s.id || s._id}
                                    layout
                                    variants={inventoryItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover="hover"
                                    className="flex justify-between items-center p-4 mb-2 bg-white rounded-xl border border-slate-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={s.imageUrl || 'https://placehold.co/50x50/f8fafc/64748b?text=Img'}
                                            alt={s.name}
                                            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                                            onError={(e) => { e.target.src = 'https://placehold.co/50x50/f8fafc/64748b?text=Img'; }}
                                        />
                                        <div>
                                            <div className="font-bold text-slate-900 text-base mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span>{s.name}</span>
                                                    {s.dietType && (
                                                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 border rounded-[2px] bg-white ${s.dietType === 'Veg' ? 'border-emerald-600' :
                                                                s.dietType === 'Non-Veg' ? 'border-red-600' :
                                                                    s.dietType === 'Vegan' ? 'border-emerald-500' : 'border-amber-600'
                                                            }`}>
                                                            <span className={`w-2 h-2 rounded-full ${s.dietType === 'Veg' ? 'bg-emerald-600' :
                                                                    s.dietType === 'Non-Veg' ? 'bg-red-600' :
                                                                        s.dietType === 'Vegan' ? 'bg-emerald-500' : 'bg-amber-600'
                                                                }`}></span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap mb-1">
                                                <span className="text-[0.7rem] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-semibold uppercase">{s.category}</span>
                                                {s.branchName && (
                                                    <span className="text-[0.7rem] bg-amber-50 px-2 py-1 rounded-md text-amber-800 font-semibold uppercase">
                                                        📍 {s.branchName}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`text-xs font-semibold mt-1.5 ${s.isAvailable ? "text-emerald-500" : "text-red-500"}`}>
                                                {s.isAvailable ? "• In Stock" : "• Sold Out"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <motion.button
                                            onClick={() => saveStockUpdate(s.id || s._id)}
                                            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-blue-500 flex items-center justify-center transition-all hover:bg-blue-50"
                                            whileHover={{ scale: 1.1 }}
                                            title="Save"
                                        >
                                            <Save size={18} />
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDeleteProduct(s.id || s._id)}
                                            className="w-9 h-9 rounded-lg border border-red-100 bg-red-50 text-red-500 flex items-center justify-center transition-all hover:bg-red-100"
                                            whileHover={{ scale: 1.1 }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${currentPage === 1
                                ? "bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100"
                                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                            }`}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-500 font-medium">
                        Page <strong className="text-slate-900">{currentPage}</strong> of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${currentPage === totalPages
                                ? "bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100"
                                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </motion.div>
    );
}
