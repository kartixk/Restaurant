import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { motion } from "framer-motion";
import { ShoppingBag, User, LogOut, Home, Settings } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, logout } = useAuthStore();
  const cartData = useCartStore((state) => state.cart);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);

  // Calculate total distinct items in cart
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
    <>
      <nav style={{
        ...styles.navbar,
        background: isAuthPage ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
        backdropFilter: isAuthPage ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: isAuthPage ? 'none' : 'blur(16px)',
        borderBottom: isAuthPage ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isAuthPage ? 'none' : '0 4px 30px rgba(0, 0, 0, 0.1)',
        position: isAuthPage ? 'absolute' : 'sticky'
      }}>
        <div className="navbar-container" style={styles.container}>

          {/* 1. BRAND LOGO */}
          <Link to={isAdminPage ? "/admin" : "/"} className="navbar-logo" style={{ ...styles.logo, margin: isAuthPage ? '0 auto' : '0' }}>
            <div style={styles.logoIcon}>
              <span style={styles.logoIconText}>F</span>
            </div>
            <span style={styles.logoText}>FoodFlow</span>
          </Link>

          {/* 2. CENTERED NAVIGATION LINKS (Hidden for Admin) */}
          {(!isAuthPage && !isAdminPage) && (
            <div className="navbar-links" style={styles.navLinks}>
              {(!role || role === "USER") && (
                <Link to="/" style={isActive("/") ? styles.activeLink : styles.link}>
                  <Home size={18} style={isActive("/") ? styles.activeIcon : styles.icon} />
                  <span className="link-text">Home</span>
                </Link>
              )}

              {(!role || role === "USER") && (
                <button onClick={() => setIsCartOpen(true)} style={{ ...styles.link, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <div style={styles.cartIconWrapper}>
                    <ShoppingBag size={18} style={styles.icon} />
                    {cartItemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="cart-badge"
                        style={styles.cartBadge}
                      >
                        {cartItemCount}
                      </motion.span>
                    )}
                  </div>
                  <span className="link-text">Order</span>
                </button>
              )}
            </div>
          )}

          {/* 3. AUTH SECTION */}
          {!isAuthPage && (
            <div className="navbar-auth" style={styles.authSection}>
              {!role ? (
                <>
                  <Link to="/login" style={styles.loginBtn}>Sign In</Link>
                  <Link to="/signup" style={styles.signupBtn}>Sign Up</Link>
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ ...styles.avatar, cursor: 'pointer' }}
                  >
                    <User size={18} color="#fff" />
                  </motion.div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={styles.dropdownMenu}
                    >
                      <div style={styles.dropdownHeader}>
                        <div style={styles.userName}>{user?.name || "User"}</div>
                        <div style={styles.userEmail}>{user?.email || ""}</div>
                        <div style={styles.userRoleBadge}>{role}</div>
                      </div>
                      <div style={styles.dropdownDivider}></div>
                      <button onClick={handleLogout} style={styles.dropdownItemLogout}>
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </nav>
      <style>{`
        /* Global Navigation Enhancements */
        .navbar-links a {
          position: relative;
          overflow: hidden;
        }
        
        .navbar-links a::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: #ec4899;
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 2px;
        }
        
        .navbar-links a:hover::after {
          width: 60%;
        }

        @media (max-width: 768px) {
          .navbar-container {
            flex-direction: column !important;
            gap: 15px !important;
            padding: 12px 15px !important;
          }
          .navbar-links {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
          .link-text {
            display: none;
          }
          .navbar-links a {
            padding: 0.6rem !important;
            border-radius: 50% !important;
          }
          .navbar-links a::after {
             display: none;
          }
          .userRole {
             display: none;
          }
        }
      `}</style>
    </>
  );
}

/* --- STYLES --- */
const styles = {
  navbar: {
    width: '100%',
    padding: '0.8rem 0',
    top: 0,
    zIndex: 1000,
    marginBottom: '0', // We will let the hero section handle spacing
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  // LOGO STYLES
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(236, 72, 153, 0.3)'
  },
  logoIconText: {
    color: 'white',
    fontWeight: '800',
    fontSize: '1.2rem',
    fontStyle: 'italic'
  },
  logoText: {
    color: '#1e293b',
    fontWeight: '800',
    letterSpacing: '0.5px',
    fontSize: '1.4rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },

  // NAVIGATION LINKS GROUP
  navLinks: {
    display: 'flex',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.5)',
    padding: '0.4rem',
    borderRadius: '100px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },

  // Default Link Style
  link: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    padding: '0.6rem 1.25rem',
    borderRadius: '100px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    color: '#64748b',
    transition: 'all 0.3s ease',
  },

  // Active Link Style
  activeLink: {
    color: '#0f172a',
    background: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '700',
    padding: '0.6rem 1.25rem',
    borderRadius: '100px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(0, 0, 0, 0.05)'
  },
  activeIcon: {
    color: '#ec4899', // Pink icon when active
  },

  cartIconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  cartBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    border: '2px solid white'
  },

  // AUTH SECTION
  authSection: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  loginBtn: {
    color: '#ec4899',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
    transition: 'color 0.2s',
  },
  signupBtn: {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    textDecoration: 'none',
    padding: '0.6rem 1.4rem',
    borderRadius: '100px',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  // LOGGED IN USER PROFILE
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
    padding: '6px 16px 6px 6px',
    borderRadius: '100px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white',
    boxShadow: '0 2px 5px rgba(236, 72, 153, 0.2)'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  userName: {
    color: '#1e293b',
    fontSize: '0.9rem',
    fontWeight: '700',
    lineHeight: '1.2'
  },
  userEmail: {
    color: '#64748b',
    fontSize: '0.7rem',
    lineHeight: '1.2'
  },
  userRole: {
    color: '#a855f7',
    fontSize: '0.7rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  iconBtn: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    marginLeft: '4px',
    transition: 'all 0.2s'
  },

  // DROPDOWN MENU
  dropdownMenu: {
    position: 'absolute',
    top: '120%',
    right: '0',
    width: '240px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    backgroundColor: '#f8fafc',
  },
  userRoleBadge: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '2px 8px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: '4px',
    width: 'fit-content'
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dropdownItemLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }
};
