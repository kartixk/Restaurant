// src/components/ManagerLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Store, UtensilsCrossed, ClipboardList, Wallet, Settings, LogOut,
    AlertTriangle, Clock, FileText, ChevronLeft, ChevronRight
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import api from "../api/axios";
import { toast } from "react-toastify";
import "./ManagerLayout.css";

export default function ManagerLayout({ children, title, subtitle }) {
    const { logout, user, isAuthenticated } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [branchError, setBranchError] = useState(null); // "no_branch" | "error" | null
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const userMenuRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) { navigate("/login"); return; }

        const fetchBranch = async () => {
            try {
                const res = await api.get("/branches/my-branch");
                if (res.data === null || res.data === undefined) {
                    // Manager has no branch yet — not an error, just a new account
                    setBranchError("no_branch");
                    setBranch(null);
                } else {
                    setBranch(res.data);
                    setBranchError(null);
                }
            } catch (err) {
                // Still handle unexpected errors (network, auth, etc.)
                if (err.response?.status === 404) {
                    setBranchError("no_branch");
                } else {
                    setBranchError("error");
                    toast.error("Failed to load store data");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBranch();
    }, [isAuthenticated, navigate, location.pathname]);

    if (loading) return (
        <div className="manager-loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a', fontWeight: 600 }}>
            Initializing Partner Console...
        </div>
    );

    const navItems = [
        { name: "Dashboard", path: "/manager/dashboard", icon: <LayoutDashboard size={18} /> },
        { name: "My Store", path: "/manager/store", icon: <Store size={18} /> },
        { name: "Menu Management", path: "/manager/menu", icon: <UtensilsCrossed size={18} /> },
        { name: "Orders", path: "/manager/orders", icon: <ClipboardList size={18} /> },
        { name: "Payouts", path: "/manager/payouts", icon: <Wallet size={18} /> },
        { name: "Settings", path: "/manager/settings", icon: <Settings size={18} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Determine the status banner to show
    const storeStatus = branch?.storeStatus?.toLowerCase();
    const isVerified = storeStatus === "verified";
    const isUnderReview = storeStatus === "under_review";
    const isPending = storeStatus === "pending";
    const isRejected = storeStatus === "rejected";
    const noBranch = branchError === "no_branch";

    // Should we show a status overlay that blocks content?
    const showBlockingBanner = noBranch || isPending || isUnderReview || isRejected || (!isVerified && !!branch);

    return (
        <div className={`manager-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <aside className="manager-sidebar">
                <div className="manager-sidebar-header">
                    <div className="manager-logo-icon">V</div>
                    {!isSidebarCollapsed && (
                        <div>
                            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "block", lineHeight: 1 }}>Velvet Plate</span>
                            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#f59e0b", letterSpacing: "1px", textTransform: "uppercase" }}>Partner Center</span>
                        </div>
                    )}
                </div>
                <nav className="manager-sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`manager-nav-item ${location.pathname === item.path ? "active" : "inactive"}`}
                            title={isSidebarCollapsed ? item.name : ""}
                        >
                            {item.icon} {!isSidebarCollapsed && item.name}
                        </Link>
                    ))}
                </nav>
                <div className="manager-sidebar-footer">
                    {!isSidebarCollapsed && (
                        <div className="manager-sidebar-user-info">
                            <div className="manager-sidebar-user-name">{user?.name}</div>
                            <div className="manager-sidebar-user-email">{user?.email}</div>
                            <div className="manager-sidebar-role-tag">{user?.role}</div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="manager-collapse-btn"
                    >
                        {isSidebarCollapsed ? <ChevronRight size={18} /> : (
                            <>
                                <ChevronLeft size={18} /> <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            <div className="manager-main-area">
                <header className="manager-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className="manager-topbar-title" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>{title}</div>
                        {branch && (
                            <>
                                <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0" }}></div>
                                <span className={`manager-badge ${isVerified ? 'manager-badge-success' : 'manager-badge-warning'}`}>
                                    {isVerified ? '🏪 Store Verified' : isPending ? '⏳ Pending Setup' : isUnderReview ? '🔍 Under Review' : '⚠️ Not Verified'}
                                </span>
                            </>
                        )}
                        {noBranch && (
                            <>
                                <div style={{ height: "20px", width: "1px", backgroundColor: "#e2e8f0" }}></div>
                                <span className="manager-badge manager-badge-warning">📋 Setup Required</span>
                            </>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {branch && (
                            <div style={{ fontWeight: 500, fontSize: "0.9rem", color: "#64748b" }}>{branch.name}</div>
                        )}

                        <div style={{ height: "32px", width: "1px", backgroundColor: "#e2e8f0" }}></div>

                        {/* User Profile Dropdown (Top Right of Navbar - Matching Admin) */}
                        <div className="manager-user-profile-wrap" ref={userMenuRef}>
                            <button
                                className={`manager-profile-toggle ${showUserMenu ? 'active' : ''}`}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <div className="manager-avatar-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <span className="manager-profile-name-sm">{user?.name?.split(' ')[0]}</span>
                            </button>

                            {showUserMenu && (
                                <div className="manager-user-dropdown-menu">
                                    <div className="manager-dropdown-header">
                                        <div className="manager-avatar-lg">
                                            {user?.name?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                        <div className="manager-user-meta">
                                            <div className="manager-user-name">{user?.name}</div>
                                            <div className="manager-user-email">{user?.email}</div>
                                        </div>
                                    </div>
                                    <div className="manager-dropdown-divider"></div>
                                    <div className="manager-dropdown-item">
                                        <span className="manager-item-label">Access Level</span>
                                        <span className="manager-item-value">{user?.role?.toUpperCase()}</span>
                                    </div>
                                    <div className="manager-dropdown-divider"></div>
                                    <button onClick={handleLogout} className="manager-dropdown-logout">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Inline Status Banners — shown INSIDE the layout, no redirects */}
                {noBranch && (
                    <div style={bannerStyles.wrapper}>
                        <div style={{ ...bannerStyles.card, borderColor: '#FF5A00' }}>
                            <div style={bannerStyles.iconCircle}>
                                <FileText size={32} color="#FF5A00" />
                            </div>
                            <h2 style={bannerStyles.title}>Complete Your Store Profile</h2>
                            <p style={bannerStyles.desc}>
                                Before you can start taking orders, please fill in your store details so we can verify and activate your restaurant.
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 16px', textAlign: 'center' }}>
                                If you previously submitted an application and it was reviewed, check your email for details from our team.
                            </p>
                            <Link to="/manager/onboarding" style={bannerStyles.ctaBtn}>
                                <FileText size={18} /> Fill Store Details
                            </Link>
                        </div>
                    </div>
                )}


                {isUnderReview && (
                    <div style={bannerStyles.wrapper}>
                        <div style={{ ...bannerStyles.card, borderColor: '#f59e0b' }}>
                            <div style={{ ...bannerStyles.iconCircle, backgroundColor: '#fffbeb' }}>
                                <Clock size={32} color="#f59e0b" />
                            </div>
                            <h2 style={bannerStyles.title}>Application Under Review</h2>
                            <p style={bannerStyles.desc}>
                                Your store profile has been submitted and is being reviewed by our team.
                                We'll send you an email once your store is verified and ready to go live.
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <span style={bannerStyles.infoPill}>📧 You'll receive an email notification</span>
                                <span style={bannerStyles.infoPill}>⏱️ Usually takes 24-48 hours</span>
                            </div>
                        </div>
                    </div>
                )}

                {isPending && branch && (
                    <div style={bannerStyles.wrapper}>
                        <div style={{ ...bannerStyles.card, borderColor: '#f59e0b' }}>
                            <div style={{ ...bannerStyles.iconCircle, backgroundColor: '#fffbeb' }}>
                                <Clock size={32} color="#f59e0b" />
                            </div>
                            <h2 style={bannerStyles.title}>Store Moved to Pending</h2>
                            <p style={bannerStyles.desc}>
                                Your store has been moved to pending status by an administrator.
                                This may be due to a policy review or compliance issue. Please wait for further communication.
                            </p>
                            <span style={{ ...bannerStyles.infoPill, backgroundColor: '#fffbeb', color: '#92400e' }}>
                                ⏳ Operations are paused — admin review in progress
                            </span>
                        </div>
                    </div>
                )}

                {isRejected && branch && (() => {
                    return (
                        <div style={bannerStyles.wrapper}>
                            <div style={{ ...bannerStyles.card, borderColor: '#ef4444', maxWidth: '560px' }}>
                                <div style={{ ...bannerStyles.iconCircle, backgroundColor: '#fef2f2' }}>
                                    <AlertTriangle size={32} color="#ef4444" />
                                </div>
                                <h2 style={{ ...bannerStyles.title, color: '#dc2626' }}>Application Rejected</h2>
                                <p style={bannerStyles.desc}>
                                    Your store application was reviewed and could not be approved at this time.
                                    Please ensure all details — business address, GST number, FSSAI license, and bank information — are accurate and complete before resubmitting.
                                </p>

                                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'center' }}>
                                    <Link to="/manager/onboarding" style={{ ...bannerStyles.ctaBtn, backgroundColor: '#16A34A' }}>
                                        <FileText size={18} /> Resubmit Application
                                    </Link>
                                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                                        Check your email for detailed rejection feedback from our team.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}


                {!isVerified && !isUnderReview && !isPending && !isRejected && branch && (
                    <div style={bannerStyles.wrapper}>
                        <div style={{ ...bannerStyles.card, borderColor: '#ef4444' }}>
                            <div style={{ ...bannerStyles.iconCircle, backgroundColor: '#fef2f2' }}>
                                <AlertTriangle size={32} color="#ef4444" />
                            </div>
                            <h2 style={bannerStyles.title}>Account Status Unknown</h2>
                            <p style={bannerStyles.desc}>
                                Your account has an unrecognized status. Please contact the admin or support for assistance.
                            </p>
                        </div>
                    </div>
                )}

                {/* Always render the page content below banners */}
                {(isVerified || !showBlockingBanner) && (
                    <main className="manager-content">
                        <div style={{ marginBottom: "2rem" }}>
                            <h1 className="manager-page-title">{title}</h1>
                            <p className="manager-page-subtitle">{subtitle}</p>
                        </div>
                        {children}
                    </main>
                )}
            </div>
        </div>
    );
}

// Banner styling
const bannerStyles = {
    wrapper: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '3rem 2rem', flex: 1
    },
    card: {
        background: '#ffffff', borderRadius: '20px', padding: '3rem 2.5rem',
        textAlign: 'center', maxWidth: '550px', width: '100%',
        border: '2px solid', boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem'
    },
    iconCircle: {
        width: '72px', height: '72px', borderRadius: '50%',
        backgroundColor: '#FFF7F0', display: 'flex', alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: '1.5rem', fontWeight: 800, color: '#0f172a',
        margin: 0, letterSpacing: '-0.02em'
    },
    desc: {
        color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6,
        margin: 0, maxWidth: '420px'
    },
    ctaBtn: {
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '14px 28px', borderRadius: '12px', backgroundColor: '#FF5A00',
        color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
        boxShadow: '0 8px 20px -4px rgba(255, 90, 0, 0.35)', transition: 'all 0.2s',
        marginTop: '0.5rem'
    },
    infoPill: {
        display: 'inline-block', padding: '8px 16px', borderRadius: '8px',
        backgroundColor: '#fffbeb', color: '#92400e', fontSize: '0.85rem',
        fontWeight: 600
    }
};
