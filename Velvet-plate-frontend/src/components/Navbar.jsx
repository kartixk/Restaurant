import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Menu, X, ShoppingCart, LayoutDashboard, Settings } from "lucide-react";
import axios from "../api/axios";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const cart = useCartStore((state) => state.cart);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      logout();
      setIsProfileOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback: still clear local state
      logout();
      navigate("/login");
    }
  };

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "MENU", path: "/menu" },
    { name: "TRACK ORDER", path: "/orders" },
  ];

  const totalItems = (cart?.items || []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/Velvet_Plate_v2.png"
              alt="Velvet Plate"
              className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
              style={{ filter: "drop-shadow(0 2px 8px rgba(255,90,0,0.28))" }}
            />
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.2rem", color: "#1a1a1a", letterSpacing: "-0.01em" }} className="hidden sm:block">
              Velvet Plate
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${location.pathname === link.path ? "text-orange-600" : "text-slate-400 hover:text-slate-900"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Cart Button */}
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-3 bg-slate-950 text-white px-6 py-2.5 rounded-full hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-950/20"
            >
              <ShoppingCart size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
              {totalItems > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isProfileOpen ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isAuthenticated ? <User size={20} /> : <User size={20} />}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 overflow-hidden"
                  >
                    {!isAuthenticated ? (
                      <div className="flex flex-col gap-1">
                        <Link
                          to="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 m-0">Login</p>
                            <p className="text-[10px] text-slate-400 m-0">Access your account</p>
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-4 border-b border-slate-50 mb-2">
                          <p className="text-sm font-black text-slate-900 m-0">{user?.name || 'User'}</p>
                          <p className="text-[10px] text-slate-400 m-0">{user?.email}</p>
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-wider">
                            {user?.role}
                          </div>
                        </div>

                        {user?.role === "ADMIN" && (
                          <Link
                            to="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                          >
                            <LayoutDashboard size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Admin Panel</span>
                          </Link>
                        )}
                        {user?.role === "MANAGER" && (
                          <Link
                            to="/manager"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900"
                          >
                            <LayoutDashboard size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Manager Dashboard</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-red-500 text-left"
                        >
                          <LogOut size={18} />
                          <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-0 z-[900] bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black text-slate-900 tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-2xl font-black text-red-500 tracking-tighter text-left"
                >
                  LOGOUT
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black text-orange-600 tracking-tighter"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
