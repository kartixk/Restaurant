import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";
import { cartStyles as styles } from "../components/features/cart/CartStyles";
import CartItem from "../components/features/cart/CartItem";
import CheckoutSummary from "../components/features/cart/CheckoutSummary";

function Cart() {
  const { data: cartData, isLoading: loading, error: cartError } = useCart();

  const cart = cartData || { items: [], total: 0 };
  const navigate = useNavigate();

  const { isAuthenticated, role, logout } = useAuthStore();
  const setCart = useCartStore((state) => state.setCart);

  useEffect(() => {
    // 1. Auth Check
    if (!role) {
      toast.error("Please login to view cart", { position: "top-center" });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // 2. Admin Check
    if (role === "ADMIN") {
      toast.warning("Admins cannot place orders", { position: "top-center" });
      setTimeout(() => navigate("/"), 2000);
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    if (cartError) {
      console.error(cartError);
      if (cartError.response && (cartError.response.status === 401 || cartError.response.status === 403)) {
        toast.error("Session expired. Please login again.");
        logout();
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error("Failed to load cart.");
      }
    }
  }, [cartError, navigate, logout]);

  useEffect(() => {
    if (cartData) setCart(cartData);
  }, [cartData, setCart]);

  // --- RENDER STATES ---

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loader}></div>
      <p style={styles.loadingText}>Loading your cart...</p>
    </div>
  );

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div style={styles.header}>
        <motion.h2
          style={styles.title}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Shopping Cart
        </motion.h2>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← Continue Shopping
        </button>
      </div>

      <AnimatePresence>
        {(!cart || cart.items.length === 0) ? (
          <motion.div
            style={styles.emptyCart}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key="empty-cart"
          >
            <div style={styles.emptyIcon}>🛒</div>
            <h3 style={styles.emptyTitle}>Your cart is empty</h3>
            <p style={styles.emptyText}>Add some delicious items to get started!</p>
            <motion.button
              onClick={() => navigate("/")}
              style={styles.shopButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Menu
            </motion.button>
          </motion.div>
        ) : (
          <div style={styles.contentWrapper} key="not-empty">
            {/* LEFT SIDE: ITEMS */}
            <div style={styles.itemsSection}>
              <AnimatePresence>
                {cart.items.map((item) => (
                  <CartItem
                    key={item.sweet || item._id}
                    item={item}
                  />
                ))}
              </AnimatePresence>
            </div>

            <CheckoutSummary />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Cart;
