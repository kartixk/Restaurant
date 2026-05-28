// src/components/ManagerLayout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import { toast } from "react-toastify";

// ─── ICONS ──────────────────────────────────────────────────────────────────
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
    ChevronLeft: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>,
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
        <div className="flex items-center justify-center h-screen w-screen bg-slate-900">
            <div className="flex flex-col items-center gap-5">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                        <img src="/Velvet_Plate_v2.png" alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 animate-ping opacity-20" />
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-[0.25em]" style={{ fontFamily: "'Playfair Display', serif" }}>Loading Partner Center</span>
            </div>
        </div>
    );

    const storeStatus = branch?.storeStatus?.toLowerCase();
    const isVerified = storeStatus === "verified";
    const isUnderReview = storeStatus === "under_review";
    const isPending = storeStatus === "pending";
    const isRejected = storeStatus === "rejected";
    const noBranch = branchError === "no_branch";
    const isLive = isVerified && branch?.isVisible;

    return (
        <div className="flex flex-row h-screen w-screen overflow-hidden box-border" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f1f5f9" }}>

            {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
            <aside
                className="flex flex-col flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                style={{
                    width: isSidebarCollapsed ? "80px" : "248px",
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                {/* Logo area */}
                <div
                    className="flex items-center flex-shrink-0 overflow-hidden"
                    style={{
                        height: "72px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        padding: isSidebarCollapsed ? "0 20px" : "0 20px",
                        justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                        gap: "12px",
                    }}
                >
                    <div
                        className="flex items-center justify-center flex-shrink-0 rounded-xl"
                        style={{
                            width: "36px", height: "36px",
                            background: "linear-gradient(135deg, #f97316, #ef4444)",
                            boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                        }}
                    >
                        <img src="/Velvet_Plate_v2.png" alt="Logo" className="w-6 h-6 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                    </div>
                    {!isSidebarCollapsed && (
                        <div>
                            <div className="text-white font-extrabold tracking-tight text-lg leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>Velvet Plate</div>
                            <div className="text-orange-400 font-bold text-[10px] uppercase tracking-[0.15em] leading-none mt-1">Partner Center</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-5" style={{ padding: isSidebarCollapsed ? "20px 10px" : "20px 12px" }}>
                    <div className="flex flex-col gap-1">
                        {NAV_ITEMS.map(({ id, path, Icon }) => {
                            const active = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    title={id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: isSidebarCollapsed ? 0 : "10px",
                                        justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                                        padding: isSidebarCollapsed ? "10px" : "10px 14px",
                                        borderRadius: "10px",
                                        textDecoration: "none",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                        overflow: "hidden",
                                        ...(active ? {
                                            background: "linear-gradient(90deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 100%)",
                                            color: "#fb923c",
                                            borderLeft: "3px solid #f97316",
                                        } : {
                                            background: "transparent",
                                            color: "rgba(148,163,184,0.9)",
                                            borderLeft: "3px solid transparent",
                                        }),
                                    }}
                                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#e2e8f0"; } }}
                                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(148,163,184,0.9)"; } }}
                                >
                                    <div style={{ width: "18px", height: "18px", flexShrink: 0 }}>
                                        <Icon />
                                    </div>
                                    {!isSidebarCollapsed && <span style={{ whiteSpace: "nowrap" }}>{id}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom: branch info + collapse */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: isSidebarCollapsed ? "12px 10px" : "12px" }}>
                    {/* Branch status badge */}
                    {!isSidebarCollapsed && branch && (
                        <div className="mb-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex-shrink-0 rounded-full"
                                    style={{
                                        width: "8px", height: "8px",
                                        backgroundColor: isLive ? "#22c55e" : "#94a3b8",
                                        boxShadow: isLive ? "0 0 0 3px rgba(34,197,94,0.2)" : "none",
                                    }}
                                />
                                <div className="min-w-0">
                                    <div className="text-white font-semibold text-xs truncate">{branch.name || "My Store"}</div>
                                    <div className="text-slate-500 text-[10px] font-medium mt-0.5">{isLive ? "Accepting Orders" : isVerified ? "Offline" : isUnderReview ? "Under Review" : "Pending"}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="flex items-center gap-2 w-full rounded-xl transition-all duration-200"
                        style={{
                            padding: isSidebarCollapsed ? "10px" : "8px 12px",
                            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "rgba(148,163,184,0.7)",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ transform: isSidebarCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                            <Icons.ChevronLeft />
                        </span>
                        {!isSidebarCollapsed && <span>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* ── RIGHT SIDE ───────────────────────────────────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">

                {/* Topbar */}
                <header
                    className="flex items-center justify-between flex-shrink-0 sticky top-0 z-50"
                    style={{
                        height: "72px",
                        padding: "0 32px",
                        background: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(226,232,240,0.8)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                >
                    {/* Left: breadcrumb or page area */}
                    <div className="flex items-center gap-3">
                        {branch && (
                            <div
                                className="flex items-center gap-2 text-sm font-semibold"
                                style={{ color: "#0f172a" }}
                            >
                                <span style={{ color: "#94a3b8", fontWeight: 500 }}>Partner Center</span>
                                <span style={{ color: "#cbd5e1" }}>/</span>
                                <span>{NAV_ITEMS.find(n => n.path === location.pathname)?.id || "Dashboard"}</span>
                            </div>
                        )}
                    </div>

                    {/* Right: status + avatar */}
                    <div className="flex items-center gap-3" ref={profileRef}>
                        {branch && (
                            <div
                                className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
                                style={{
                                    ...(isVerified
                                        ? { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }
                                        : isUnderReview
                                            ? { background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309" }
                                            : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#64748b" }
                                    ),
                                }}
                            >
                                <span
                                    className="rounded-full"
                                    style={{
                                        width: "6px", height: "6px",
                                        backgroundColor: isVerified ? "#22c55e" : isUnderReview ? "#f59e0b" : "#94a3b8",
                                    }}
                                />
                                {isVerified ? "Verified" : isUnderReview ? "Under Review" : isPending ? "Pending" : "Check Status"}
                            </div>
                        )}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center justify-center rounded-xl transition-all duration-200"
                                style={{
                                    width: "40px", height: "40px",
                                    background: isProfileOpen ? "linear-gradient(135deg, #f97316, #ef4444)" : "#f1f5f9",
                                    border: isProfileOpen ? "none" : "1px solid #e2e8f0",
                                    color: isProfileOpen ? "white" : "#475569",
                                    cursor: "pointer",
                                    boxShadow: isProfileOpen ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                                }}
                            >
                                <Icons.User />
                            </button>
                            {isProfileOpen && (
                                <div
                                    className="absolute top-[calc(100%+8px)] right-0 overflow-hidden"
                                    style={{
                                        width: "240px",
                                        background: "white",
                                        borderRadius: "16px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
                                        zIndex: 100,
                                    }}
                                >
                                    <div style={{ padding: "16px", background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "white" }}>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex items-center justify-center rounded-xl flex-shrink-0"
                                                style={{
                                                    width: "40px", height: "40px",
                                                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                                                }}
                                            >
                                                <Icons.User />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm truncate">{user?.name || "User"}</div>
                                                <div className="text-slate-400 text-xs truncate">{user?.email || ""}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full transition-colors"
                                        style={{
                                            padding: "12px 16px",
                                            background: "white",
                                            border: "none",
                                            color: "#ef4444",
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                                    >
                                        <Icons.Logout /> <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden" style={{ background: "#f1f5f9" }}>

                    {/* Status banners */}
                    {(noBranch || isUnderReview || isPending || isRejected) && (
                        <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", padding: "32px 40px 0", boxSizing: "border-box" }}>
                            {noBranch && (
                                <div className="mb-6 flex items-center gap-5 rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: "24px 28px" }}>
                                    <div className="flex items-center justify-center rounded-2xl flex-shrink-0" style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #fff7ed, #ffedd5)" }}>
                                        <div style={{ color: "#f97316" }}><Icons.FileText /></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 text-base mb-0.5">Complete Your Onboarding</h3>
                                        <p className="text-slate-500 text-sm font-medium">Set up your restaurant profile to start accepting orders.</p>
                                    </div>
                                    <Link to="/manager/onboarding" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white whitespace-nowrap" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", textDecoration: "none", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
                                        Start Setup →
                                    </Link>
                                </div>
                            )}
                            {isUnderReview && (
                                <div className="mb-6 flex items-center gap-4 rounded-2xl" style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "18px 24px" }}>
                                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: "40px", height: "40px", background: "#fef3c7" }}><div style={{ color: "#d97706" }}><Icons.Clock /></div></div>
                                    <div>
                                        <h4 className="font-bold text-amber-900 text-sm">Application Under Review</h4>
                                        <p className="text-amber-700 text-xs font-medium mt-0.5">Our team is verifying your FSSAI license and bank details. This typically takes 12–24 hours.</p>
                                    </div>
                                </div>
                            )}
                            {isPending && !noBranch && (
                                <div className="mb-6 flex items-center gap-4 rounded-2xl" style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "18px 24px" }}>
                                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: "40px", height: "40px", background: "#fef3c7" }}><div style={{ color: "#d97706" }}><Icons.Alert /></div></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-amber-900 text-sm">Store Deactivated</h4>
                                        <p className="text-amber-700 text-xs font-medium mt-0.5">Your store has been temporarily suspended. Contact support for more information.</p>
                                    </div>
                                    <Link to="/manager/status" className="px-4 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap" style={{ background: "#d97706", textDecoration: "none" }}>View Status</Link>
                                </div>
                            )}
                            {isRejected && (
                                <div className="mb-6 flex items-center gap-4 rounded-2xl" style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "18px 24px" }}>
                                    <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: "40px", height: "40px", background: "#fee2e2" }}><div style={{ color: "#ef4444" }}><Icons.X /></div></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-900 text-sm">Application Rejected</h4>
                                        <p className="text-red-700 text-xs font-medium mt-0.5">Discrepancies were found in your documents (GST/FSSAI). Please resubmit with corrections.</p>
                                    </div>
                                    <Link to="/manager/onboarding" className="px-4 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap" style={{ background: "#ef4444", textDecoration: "none" }}>Resubmit</Link>
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
