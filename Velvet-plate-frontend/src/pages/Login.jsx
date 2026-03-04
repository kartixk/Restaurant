// src/pages/Login.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import { Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user);
      const role = res.data.user?.role?.toUpperCase();

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "MANAGER") {
        navigate("/manager/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      let errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Invalid email or password";
      if (err.response?.status === 404 || errMsg === "User not found") {
        errMsg = "Please create an account";
      } else if (typeof errMsg === 'object') {
        errMsg = errMsg.message || "An unexpected error occurred.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 font-sans py-8 px-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 z-0" />
      <motion.div
        className="fixed top-[5%] left-[10%] w-[400px] h-[400px] rounded-full blur-[60px] z-10 opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(255, 90, 0, 0.12) 0%, rgba(255, 255, 255, 0) 70%)' }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[5%] right-[10%] w-[500px] h-[500px] rounded-full blur-[80px] z-10 opacity-50"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%)' }}
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />

      <motion.div
        className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[32px] shadow-2xl shadow-orange-500/5 p-10 w-full max-w-[420px] relative z-20 flex flex-col gap-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-1"
          >
            <KeyRound size={32} className="text-orange-600" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight leading-none">Welcome Back</h2>
            <p className="text-slate-500 font-medium mt-3 mb-0 text-sm">Sign in to access your partner dashboard</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-400"
            />
          </div>

          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right -mt-2">
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors transition-all no-underline">Forgot password?</a>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-center font-bold">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="w-full py-4 bg-orange-600 text-white rounded-2xl text-base font-black shadow-xl shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : "Sign In"}
          </motion.button>
        </form>

        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">secure access</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 text-sm font-bold m-0">
            Don't have an account?{" "}
            <Link to="/register" className="text-orange-600 font-black no-underline hover:text-orange-700 transition-colors ml-1">
              Join Ecosystem
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
