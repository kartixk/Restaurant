// src/components/features/admin/SalesOverview.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, BarChart3, FileSpreadsheet, Calendar, History, Store } from "lucide-react";

export default function SalesOverview({ reportSummary, salesList, reportType, reportLoading, fetchReport, downloadExcel, AnimatedNumber }) {
    const isDayView = reportType === 'day';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm flex flex-col gap-8 h-full"
        >
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">Global Performance</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2 italic">Real-time multisite sales monitoring</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-inner">
                    <Calendar size={12} />
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-orange-600 rounded-[28px] p-8 text-white shadow-xl shadow-orange-600/20 flex flex-col justify-between relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={80} />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Aggregate Revenue</span>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp size={16} /></div>
                    </div>
                    <div className="relative z-10 text-4xl font-black mt-6 leading-none tracking-tighter">
                        ₹<AnimatedNumber value={reportSummary.totalAmount} />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-[28px] p-8 border border-slate-200 shadow-sm flex flex-col justify-between group"
                >
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total System Orders</span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors"><BarChart3 size={16} /></div>
                    </div>
                    <div className="text-4xl font-black text-slate-900 mt-6 leading-none tracking-tighter">
                        <AnimatedNumber value={reportSummary.count} />
                    </div>
                </motion.div>
            </div>

            {/* Filters & Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100">
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner overflow-x-auto max-w-full">
                    {['day', 'week', 'month', 'year', 'all'].map(t => (
                        <button
                            key={t}
                            onClick={() => fetchReport(t)}
                            className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap ${reportType === t
                                    ? "bg-white text-orange-600 shadow-md border border-orange-100"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {t === 'day' ? "TODAY" : t === 'all' ? "ALL TIME" : t.toUpperCase()}
                        </button>
                    ))}
                </div>
                <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[11px] tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <FileSpreadsheet size={16} className="text-orange-500" /> EXPORT CSV
                </button>
            </div>

            {/* Detailed Transaction Table */}
            <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden flex flex-col flex-1 shadow-inner shadow-slate-950/[0.02]">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse table-auto">
                        <thead className="sticky top-0 z-20">
                            <tr className="bg-slate-50/50 backdrop-blur-md border-b border-slate-200">
                                {!isDayView && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[15%]">Date</th>}
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[12%]">Time</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[28%]">Menu Item</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[18%]">Restaurant</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[10%] text-center">Qty</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] w-[17%] text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reportLoading ? (
                                <tr>
                                    <td colSpan={isDayView ? 5 : 6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-8 h-8 border-3 border-orange-600/20 border-t-orange-600 rounded-full animate-spin"></div>
                                            <span className="text-xs font-bold text-slate-400 italic">Syncing global transactions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : salesList.length === 0 ? (
                                <tr>
                                    <td colSpan={isDayView ? 5 : 6} className="px-6 py-20 text-center flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200"><History size={24} /></div>
                                        <span className="text-xs font-bold text-slate-400">No transactions recorded for this period.</span>
                                    </td>
                                </tr>
                            ) : (
                                salesList.flatMap((s, sIndex) =>
                                    s.items.map((item, iIndex) => {
                                        const dateObj = new Date(s.createdAt || s.date);
                                        return (
                                            <motion.tr
                                                key={`${s.id}-${iIndex}`}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="group hover:bg-slate-50/50 transition-colors"
                                            >
                                                {!isDayView && <td className="px-6 py-4 text-[11px] font-bold text-slate-500 font-mono tracking-tighter">{dateObj.toLocaleDateString('en-GB')}</td>}
                                                <td className="px-6 py-4 text-[11px] font-black text-slate-300 group-hover:text-slate-600 transition-colors font-mono tracking-tighter">
                                                    {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-slate-900 group-hover:translate-x-1 transition-transform duration-300">{item.productName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                        <Store size={12} className="text-slate-300" /> {s.branchName || "Main"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-slate-100 text-slate-900 px-2 py-1 rounded-lg text-[10px] font-black ring-1 ring-inset ring-slate-200 shadow-sm">
                                                        {item.quantity || item.selectedQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-sm font-black text-emerald-600 tracking-tight">₹{item.totalPrice.toLocaleString('en-IN')}</div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
