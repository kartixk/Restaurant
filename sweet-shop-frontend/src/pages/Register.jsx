// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Phone } from "lucide-react";
import "./Register.css";

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
  const strengthColors = ["#EF4444", "#F59E0B", "#10B981", "#059669"];

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
    <div className="register-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="register-animated-background"></div>
      <motion.div
        className="register-blob1"
        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="register-blob2"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />

      <motion.div
        className="register-glass-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="register-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="register-icon-container"
          >
            <ShieldCheck size={28} color="#FF5A00" strokeWidth={2.5} />
          </motion.div>
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join our premium restaurant ecosystem</p>
        </div>

        <div className="register-role-toggle-container">
          <div
            onClick={() => setRole("CUSTOMER")}
            className={`register-role-option ${role === "CUSTOMER" ? "register-role-active" : "register-role-inactive"}`}
          >
            Customer
          </div>
          <div
            onClick={() => setRole("MANAGER")}
            className={`register-role-option ${role === "MANAGER" ? "register-role-active" : "register-role-inactive"}`}
          >
            Franchise Manager
          </div>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-input-wrapper">
            <User size={18} className="register-input-icon" />
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="register-input" />
          </div>

          <div className="register-input-wrapper">
            <Mail size={18} className="register-input-icon" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="register-input" />
          </div>

          <div className="register-input-wrapper">
            <Phone size={18} className="register-input-icon" />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="register-input" />
          </div>

          <div className="register-input-wrapper">
            <Lock size={18} className="register-input-icon" />
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="register-input" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="register-eye-btn">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="register-strength-container">
              <div className="register-strength-bars">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="register-strength-bar" style={{ backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : "#E2E8F0" }} />
                ))}
              </div>
              <span className="register-strength-text" style={{ color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : "#94A3B8" }}>
                {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ""}
              </span>
            </div>
          )}

          <div className="register-input-wrapper">
            <Lock size={18} className="register-input-icon" />
            <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="register-input" />
          </div>

          <motion.button type="submit" className="register-submit-button" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? <div className="register-loader"></div> : (role === "MANAGER" ? "Submit Application" : "Create Account")}
          </motion.button>
        </form>

        <div className="register-footer">
          <p className="register-footer-text">
            Already have an account? <Link to="/login" className="register-link">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}