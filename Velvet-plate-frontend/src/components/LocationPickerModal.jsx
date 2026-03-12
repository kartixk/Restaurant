import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Search, Navigation, X } from 'lucide-react';
import api from '../api/axios';
import useLocationStore from '../store/useLocationStore';

export default function LocationPickerModal({ isOpen, onClose, forceSelection = false }) {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { setLocation } = useLocationStore();

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
        }
    }, [isOpen]);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await api.get('/branches/list/public');
            setBranches(res.data);
        } catch (err) {
            console.error("Failed to fetch branches", err);
        } finally {
            setLoading(false);
        }
    };

    const cities = [...new Set(branches.map(b => b.city))].sort();

    const handleSelect = (branch) => {
        setLocation(branch.id || branch._id, branch.name, branch.city);
        onClose();
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => !forceSelection && onClose()}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {!forceSelection && (
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors z-10"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="p-8 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3 mb-2 text-orange-600">
                                <Navigation size={24} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select Location</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-6">
                                Choose your nearest <br />
                                <span className="text-orange-600 italic">Velvet Plate</span>
                            </h2>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by city, area or restaurant name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-slate-900"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 pt-4">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                                    <div className="w-8 h-8 border-4 border-slate-100 border-t-orange-600 rounded-full animate-spin" />
                                    <span className="font-bold text-xs uppercase tracking-widest">Finding branches...</span>
                                </div>
                            ) : filteredBranches.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin size={24} className="text-slate-200" />
                                    </div>
                                    <p className="font-bold text-slate-900 mb-1">
                                        {searchTerm ? "Sorry we are not available in this location" : "No branches found"}
                                    </p>
                                    <p className="text-slate-400 text-sm">Try searching for a different area or city.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {cities.map(city => {
                                        const cityBranches = filteredBranches.filter(b => b.city === city);
                                        if (cityBranches.length === 0) return null;
                                        return (
                                            <div key={city}>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-4">
                                                    {city}
                                                    <div className="flex-1 h-px bg-slate-100" />
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {cityBranches.map(branch => (
                                                        <motion.button
                                                            key={branch.id || branch._id}
                                                            whileHover={{ scale: 1.01, x: 4 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            onClick={() => handleSelect(branch)}
                                                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all text-left group"
                                                        >
                                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 group-hover:border-orange-200 transition-all">
                                                                <img
                                                                    src={branch.storeImageUrl || '/restaurant-default.png'}
                                                                    alt={branch.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    onError={(e) => {
                                                                        e.target.src = '/restaurant-default.png';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-slate-900 truncate m-0">{branch.name}</h4>
                                                                <p className="text-xs text-slate-500 truncate m-0 mt-0.5">{branch.location}, {branch.city}</p>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                                <ChevronRight size={16} />
                                                            </div>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 leading-none">
                                    {branches.length} verified locations
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                                <Navigation size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Reach</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
