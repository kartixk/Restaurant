import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Phone } from "lucide-react";

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

  // Simple password strength calculation
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
  const strengthColors = ["#ef4444", "#f59e0b", "#10b981", "#059669"];

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right", autoClose: 3000, theme: "colored"
      });
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", { name, email, phone, password, role });

      if (role === "MANAGER") {
        toast.info("Registration successful! Please wait for admin approval before logging in.", {
          position: "top-right", autoClose: 4000, theme: "colored"
        });
      } else {
        toast.success("Registration successful! Please login.", {
          position: "top-right", autoClose: 2000, theme: "colored"
        });
      }

      navigate("/login");
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning("Too many registration attempts. Please try again later.", {
          position: "top-right", autoClose: 4000, theme: "colored"
        });
        return;
      }

      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Registration failed";

      if (errorMsg === "Email already in use") {
        toast.info("User already exists! Please sign in instead.", {
          position: "top-right", autoClose: 4000, theme: "colored", icon: "👋"
        });
      } else {
        toast.error(errorMsg, {
          position: "top-right", autoClose: 3000, theme: "colored"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <div style={styles.animatedBackground}></div>
      <motion.div
        style={styles.blob1}
        animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        style={styles.blob2}
        animate={{ y: [0, 40, 0], x: [0, -30, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <div style={styles.radialGlow}></div>

      <motion.div
        style={styles.glassCard}
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
      >
        <div style={styles.header}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={styles.iconContainer}
          >
            <ShieldCheck size={32} color="#fff" />
          </motion.div>
          <h2 style={styles.title}>Create Account</h2>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputWrapper}>
            <User size={18} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputWrapper}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputWrapper}>
            <Phone size={18} style={styles.inputIcon} />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {password.length > 0 && (
            <div style={styles.strengthContainer}>
              <div style={styles.strengthBars}>
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.strengthBar,
                      backgroundColor: index < passwordStrength ? strengthColors[passwordStrength - 1] : "rgba(255, 255, 255, 0.2)"
                    }}
                  />
                ))}
              </div>
              <span style={{ ...styles.strengthText, color: passwordStrength > 0 ? strengthColors[passwordStrength - 1] : "rgba(255,255,255,0.7)" }}>
                {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ""}
              </span>
            </div>
          )}

          <div style={styles.roleToggleContainer}>
            <div
              onClick={() => setRole("CUSTOMER")}
              style={{ ...styles.roleOption, ...(role === "CUSTOMER" ? styles.roleActive : styles.roleInactive) }}
            >
              Customer
            </div>
            <div
              onClick={() => setRole("MANAGER")}
              style={{ ...styles.roleOption, ...(role === "MANAGER" ? styles.roleActive : styles.roleInactive) }}
            >
              Manager
            </div>
          </div>

          <motion.button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <div style={styles.loader}></div> : "Sign Up"}
          </motion.button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine}></span>
        </div>


        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Injecting keyframes for the background animation */}
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active{
              -webkit-box-shadow: 0 0 0 30px rgba(0,0,0,0.5) inset !important;
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#0f172a',
    fontFamily: "'Inter', 'Poppins', sans-serif",
    padding: '6rem 1rem 2rem 1rem', // Increased top padding to avoid logo overlap
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  animatedBackground: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(-45deg, #1e1b4b, #312e81, #4c1d95, #701a75, #831843)',
    backgroundSize: '400% 400%',
    animation: 'gradientBG 15s ease infinite',
    opacity: 0.8,
    zIndex: 0,
    position: 'fixed' // Fix background for scrolling
  },
  blob1: {
    position: 'fixed', // Keep blobs fixed
    top: '10%',
    left: '15%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    zIndex: 1
  },
  blob2: {
    position: 'fixed', // Keep blobs fixed
    bottom: '10%',
    right: '15%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    zIndex: 1
  },
  radialGlow: {
    position: 'fixed', // Keep glow fixed
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 60%)',
    zIndex: 1
  },
  glassCard: {
    background: 'rgba(15, 23, 42, 0.6)', // Darker shade
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(255,255,255,0.02)',
    padding: '2.5rem 1.5rem', // Adjusted for mobile
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem'
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
    boxShadow: '0 10px 25px rgba(168, 85, 247, 0.4)'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontSize: '1rem',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    borderRadius: '50%'
  },
  roleToggleContainer: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '4px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '0.25rem'
  },
  roleOption: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  roleActive: {
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
  },
  roleInactive: {
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 4px',
    marginTop: '-0.5rem'
  },
  strengthBars: {
    display: 'flex',
    gap: '6px',
    flex: 1,
    marginRight: '1rem'
  },
  strengthBar: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.3s ease'
  },
  strengthText: {
    fontSize: '0.75rem',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'right'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '0.5rem'
  },
  loader: {
    width: '24px',
    height: '24px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spin 1s ease-in-out infinite'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)'
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  socialBtn: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background-color 0.2s'
  },
  footer: {
    textAlign: 'center',
    marginTop: '0.5rem'
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    margin: 0
  },
  link: {
    color: '#e879f9',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s'
  }
};