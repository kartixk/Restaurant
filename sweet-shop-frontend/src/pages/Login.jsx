// src/pages/Login.jsx
import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/useAuthStore";
import { Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

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
        // Always go to dashboard — ManagerLayout handles status banners inline
        navigate("/manager/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-animated-background"></div>
      <motion.div
        className="login-blob1"
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="login-blob2"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <div className="login-radial-glow"></div>

      <motion.div
        className="login-glass-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="login-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="login-icon-container"
          >
            <KeyRound size={32} color="#FF5A00" strokeWidth={2.5} />
          </motion.div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-wrapper">
            <Mail size={18} className="login-input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="login-input-wrapper">
            <Lock size={18} className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-eye-btn"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="login-forgot-password">
            <a href="#" className="login-link-small">Forgot password?</a>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="login-error-container"
              >
                <div className="login-error-message">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="login-submit-button"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <div className="login-loader"></div> : "Sign In"}
          </motion.button>
        </form>

        <div className="login-divider">
          <span className="login-divider-line"></span>
          <span className="login-divider-text">OR</span>
          <span className="login-divider-line"></span>
        </div>

        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account?{" "}
            <Link to="/signup" className="login-link">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}