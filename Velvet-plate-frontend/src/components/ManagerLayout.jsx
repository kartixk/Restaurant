// src/components/ManagerLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";

// ─── ICONS (matches Admin exactly) ─────────────────────────────────────────
const Icons = {
    Dashboard: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Store: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Menu: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Orders: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    Payouts: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    Settings: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    User: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Logout: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    FileText: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Clock: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Alert: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.734 0L3.07 16.5C2.3 17.333 3.262 19 4.8 19z" /></svg>,
    X: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    Shield: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

const NAV_ITEMS = [
    { id: "Dashboard", path: "/manager/dashboard", Icon: Icons.Dashboard },
    { id: "My Store", path: "/manager/store", Icon: Icons.Store },
    { id: "Menu Management", path: "/manager/menu", Icon: Icons.Menu },
    { id: "Orders", path: "/manager/orders", Icon: Icons.Orders },
    { id: "Payouts", path: "/manager/payouts", Icon: Icons.Payouts },
    { id: "Settings", path: "/manager/settings", Icon: Icons.Settings },
];

export default function ManagerLayout({ children }) {
    const { logout, user, isAuthenticated } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [branchError, setBranchError] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }
        const fetchBranch = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                if (!res.data) { setBranchError("no_branch"); setBranch(null); }
                else { setBranch(res.data); setBranchError(null); }
            } catch (err) {
                if (err.response?.status === 404) setBranchError("no_branch");
                else { setBranchError("error"); toast.error("Failed to load store data"); }
            } finally { setLoading(false); }
        };
        fetchBranch();
    }, [isAuthenticated, navigate, location.pathname]);

    const handleLogout = () => { logout(); navigate("/login"); };

    if (loading) return (
        <div className="flex items-center justify-center h-screen w-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
            <img src="/Velvet_Plate_v2.png" alt="Logo" className="w-12 h-12 object-contain animate-pulse drop-shadow-xl" />
            <span className="text-sm text-slate-400 font-medium tracking-wide uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>Velvet Plate</span>
        </div>
        </div>
    );

    const storeStatus = branch?.storeStatus?.toLowerCase();
    const isVerified = storeStatus === "verified";
    const isUnderReview = storeStatus === "under_review";
    const isPending = storeStatus === "pending";
    const isRejected = storeStatus === "rejected";
    const noBranch = branchError === "no_branch";

    return (
        <div className="flex flex-row h-screen w-screen bg-slate-50 font-inter text-slate-900 overflow-hidden box-border">

            {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
            <div className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarCollapsed ? "w-[80px]" : "w-[240px]"}`}>
                <div className="flex-1 flex flex-col">

                    {/* Logo */}
                    <div className={`h-[72px] flex items-center border-b border-slate-200 flex-shrink-0 ${isSidebarCollapsed ? "justify-center px-0" : "justify-start px-5"}`}>
                        <img src="/Velvet_Plate_v2.png" alt="Logo" className="w-9 h-9 object-contain drop-shadow-sm" />
                        {!isSidebarCollapsed && (
                            <span className="text-slate-900 font-extrabold tracking-tight text-xl whitespace-nowrap ml-3"
                                  style={{ fontFamily: "'Playfair Display', serif" }}>
                                Velvet Plate
                            </span>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="py-6 px-4 flex flex-col gap-2">
                        {NAV_ITEMS.map(({ id, path, Icon }) => {
                            const active = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    title={id}
                                    className={`flex items-center gap-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 overflow-hidden box-border ${isSidebarCollapsed ? "justify-center p-3" : "justify-start py-2.5 px-4"} ${active ? "bg-[#FFF7F5] text-[#FF5A00] border-l-4 border-[#FF5A00]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                                >
                                    <div className={`flex items-center justify-center w-6 h-6 flex-shrink-0 ${active ? "text-[#FF5A00]" : "text-slate-400"}`}>
                                        <Icon />
                                    </div>
                                    {!isSidebarCollapsed && <span className="whitespace-nowrap">{id}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Collapse Button */}
                    <div className={`mt-auto ${isSidebarCollapsed ? "p-4 px-2" : "p-4"}`}>
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="flex items-center justify-center gap-2 w-full p-2.5 rounded-lg border-none bg-[#FFF7F5] text-slate-500 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-orange-50"
                        >
                            <svg className={`transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {!isSidebarCollapsed && <span>Collapse</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── RIGHT SIDE ───────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">

                {/* Topbar */}
                <header className="h-[72px] bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50 sticky top-0">
                    <div />

                    {/* Centered title */}
                    <div className="absolute left-1/2 -translate-x-1/2 font-semibold text-slate-900 text-lg">
                        Partner Center
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3" ref={profileRef}>
                        {branch && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${isVerified ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {isVerified ? "Verified" : isUnderReview ? "Under Review" : isPending ? "Pending" : "Check Status"}
                            </div>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-slate-200"
                            >
                                <Icons.User />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute top-[120%] right-0 w-[220px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-[100]">
                                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                                        <div className="font-semibold text-slate-900 text-sm">{user?.name || "User"}</div>
                                        <div className="text-slate-500 text-xs mt-0.5">{user?.email || ""}</div>
                                        <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">{user?.role}</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full p-3 px-4 border-none bg-white text-red-500 text-sm font-semibold cursor-pointer transition-colors hover:bg-red-50"
                                    >
                                        <Icons.Logout /> <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden text-slate-900 bg-slate-50">

                    {/* Status banners */}
                    {(noBranch || isUnderReview || isPending || isRejected) && (
                        <div className="max-w-[1400px] w-full mx-auto px-10 pt-10 box-border">
                            {noBranch && (
                                <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#FFF7F5] flex items-center justify-center text-[#FF5A00]"><Icons.FileText /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Your Onboarding</h3>
                                        <p className="text-sm text-slate-500 font-medium max-w-md">Set up your restaurant profile to start accepting orders on Velvet Plate.</p>
                                    </div>
                                    <Link to="/manager/onboarding" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                                        Start Setup →
                                    </Link>
                                </div>
                            )}
                            {isUnderReview && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0"><Icons.Clock /></div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm">Application Under Review</h4>
                                        <p className="text-amber-700 text-xs font-medium mt-0.5">Our team is verifying your FSSAI license and bank details. This typically takes 12–24 hours.</p>
                                    </div>
                                </div>
                            )}
                            {isPending && !noBranch && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0"><Icons.Alert /></div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm">Store Deactivated</h4>
                                        <p className="text-amber-700 text-xs font-medium mt-0.5">Your store has been temporarily suspended. Contact support for more information.</p>
                                    </div>
                                    <Link to="/manager/status" className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors whitespace-nowrap">View Status</Link>
                                </div>
                            )}
                            {isRejected && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0"><Icons.X /></div>
                                    <div>
                                        <h4 className="font-bold text-red-900 text-sm">Application Rejected</h4>
                                        <p className="text-red-700 text-xs font-medium mt-0.5">Discrepancies were found in your documents (GST/FSSAI). Please resubmit with corrections.</p>
                                    </div>
                                    <Link to="/manager/onboarding" className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors whitespace-nowrap">Resubmit</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Page content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
