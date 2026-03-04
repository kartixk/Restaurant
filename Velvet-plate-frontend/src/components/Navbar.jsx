import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, LogOut, Home } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, logout } = useAuthStore();
  const cartData = useCartStore((state) => state.cart);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);

  const cartItemCount = cartData?.items?.length || 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/signup";
  const isInternalPage = location.pathname.startsWith("/admin") || location.pathname.startsWith("/manager");
  const isAdminPage = role === "ADMIN";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isInternalPage) return null;

  return (
    <nav className={`w-full top-0 z-[1000] transition-all duration-300 ${isAuthPage
        ? "bg-transparent border-none shadow-none absolute"
        : "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm sticky"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">

        {/* 1. BRAND LOGO */}
        <Link
          to={isAdminPage ? "/admin" : "/"}
          className={`flex items-center gap-3 no-underline group ${isAuthPage ? 'mx-auto' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:rotate-12 transition-all">
            <span className="text-white font-black text-xl italic leading-none">V</span>
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 group-hover:text-pink-600 transition-colors">
            Velvet Plate
          </span>
        </Link>

        {/* 2. CENTERED NAVIGATION LINKS */}
        {(!isAuthPage && !isAdminPage) && (
          <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200 shadow-inner">
            {(!role || role === "USER") && (
              <Link
                to="/"
                className={`relative px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all group ${isActive("/")
                    ? "bg-white text-slate-950 shadow-md ring-1 ring-black/5"
                    : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <Home size={14} className={isActive("/") ? "text-pink-500" : "text-slate-400 group-hover:text-slate-600"} />
                <span>Home</span>
                {!isActive("/") && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-pink-500 transition-all group-hover:w-1/3 rounded-full" />
                )}
              </Link>
            )}

            {(!role || role === "USER") && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all flex items-center gap-2 group"
              >
                <div className="relative">
                  <ShoppingBag size={14} className="group-hover:text-slate-600 transition-colors" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[9px] font-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center ring-2 ring-white shadow-md shadow-red-500/20"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </div>
                <span>Order</span>
              </button>
            )}
          </div>
        )}

        {/* 3. AUTH SECTION */}
        {!isAuthPage && (
          <div className="flex items-center gap-4">
            {!role ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  to="/login"
                  className="px-4 md:px-6 py-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-pink-600 transition-all underline decoration-pink-500/0 hover:decoration-pink-500/100 underline-offset-8"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Join Us
                </Link>
              </div>
            ) : (
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-2 ring-white shadow-lg shadow-pink-500/20 cursor-pointer overflow-hidden group"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} color="#fff" />
                  )}
                </motion.div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute top-[120%] right-0 w-64 bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 overflow-hidden z-[1001]"
                      >
                        <div className="p-6 bg-slate-50 flex flex-col gap-1 border-b border-slate-100">
                          <div className="text-slate-950 font-black text-sm tracking-tight leading-none mb-1">
                            {user?.name || "Premium Member"}
                          </div>
                          <div className="text-slate-400 font-medium text-xs mb-3">
                            {user?.email || "member@velvetplate.com"}
                          </div>
                          <div className="px-3 py-1 bg-pink-100 text-pink-600 text-[9px] font-black uppercase tracking-widest rounded-full w-fit">
                            {role}
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={handleLogout}
                            className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all group"
                          >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-black text-xs uppercase tracking-widest">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
