// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let strength = 0;
    if (password.length > 5) strength++;
    if (password.length > 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
  const textColors = ["text-red-500", "text-amber-500", "text-emerald-500", "text-emerald-600"];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const payload = { name, email, phone, password, role };
      await api.post("/auth/register", payload);

      if (role === "MANAGER") {
        toast.info("Application submitted! Please wait for admin approval.", { autoClose: 5000 });
      } else {
        toast.success("Account created! Please log in.");
      }
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      if (errorMsg === "Email already in use") {
        toast.info("User already exists! Please sign in instead.", { icon: "👋" });
      } else if (err.response?.status === 429) {
        toast.warning("Too many registration attempts. Please try again later.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 font-sans py-12 px-4 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

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
        className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[32px] shadow-2xl shadow-orange-500/5 p-10 w-full max-w-[460px] relative z-20 flex flex-col gap-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 m-0 tracking-tight leading-none">Create Account</h2>
          <p className="text-slate-500 font-medium mt-3 mb-0 text-sm">Join our premium restaurant ecosystem</p>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setRole("CUSTOMER")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${role === "CUSTOMER"
                ? "bg-white text-orange-600 shadow-md"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Customer
          </button>
          <button
            onClick={() => setRole("MANAGER")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${role === "MANAGER"
                ? "bg-white text-orange-600 shadow-md"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Franchise Manager
          </button>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="relative flex items-center">
            <User size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-400"
            />
          </div>

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
            <Phone size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          {password.length > 0 && (
            <div className="px-1 -mt-2">
              <div className="flex gap-1.5 mb-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-slate-100"
                      }`}
                  />
                ))}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-wider ${passwordStrength > 0 ? textColors[passwordStrength - 1] : "text-slate-400"}`}>
                {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "secure password required"}
              </div>
            </div>
          )}

          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 placeholder:text-slate-400"
            />
          </div>

          <motion.button
            type="submit"
            className="w-full py-4 bg-orange-600 text-white rounded-2xl text-base font-black shadow-xl shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (role === "MANAGER" ? "Submit Application" : "Create Account")}
          </motion.button>
        </form>

        <div className="text-center">
          <p className="text-slate-500 text-sm font-bold m-0">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-600 font-black no-underline hover:text-orange-700 transition-colors ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
