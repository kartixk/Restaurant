// src/pages/Products.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { data: productsData = [], error: productsError } = useProducts(selectedBranch);
  const addToCartMutation = useAddToCart();

  // Zustand State
  const { quantities, setQuantity, clearQuantity, orderType, setOrderType } = useCartStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const navigate = useNavigate();

  const { isAuthenticated, role: upperRole } = useAuthStore();
  const role = upperRole ? upperRole.toLowerCase() : null;

  const products = [...productsData].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (productsError) toast.error("Failed to load menu items.");
  }, [productsError]);

  /* --- QUANTITY HANDLERS --- */
  const handleQuantityChange = (productId, delta, maxStock) => {
    const currentQty = quantities[productId] || 1;
    const newQty = currentQty + delta;
    if (newQty >= 1 && newQty <= maxStock) {
      setQuantity(productId, newQty);
    } else if (newQty > maxStock) {
      toast.warning(`Only ${maxStock} available`);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) return navigate("/login");
    if (role === 'admin' || role === 'manager') return toast.warning("Staff cannot place orders here.");

    const qty = quantities[product.id || product._id] || 1;

    // Pass orderType to the mutation here
    addToCartMutation.mutate({ productId: product.id || product._id, quantity: qty, orderType }, {
      onSuccess: () => {
        toast.success(`Added to cart (${orderType.replace('_', ' ')}) 🛒`);
        clearQuantity(product.id || product._id);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to add to cart.");
      }
    });
  };

  const uniqueCategories = ["ALL", ...[...new Set(products.map(s => s.category?.toUpperCase().trim() || ""))].sort()];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || (product.category?.toUpperCase().trim() || "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      {/* --- PREMIUM HERO SECTION --- */}
      <section style={styles.heroSection}>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.heroTitle}>
          Crave It. <span style={{ color: '#FF5A00' }}>Order It.</span>
        </motion.h1>

        {/* QSR ORDER TYPE TOGGLE */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} style={styles.toggleContainer}>
          <button
            style={{ ...styles.toggleBtn, ...(orderType === 'DINE_IN' ? styles.toggleActive : {}) }}
            onClick={() => setOrderType('DINE_IN')}
          >
            🍽️ Dine-in
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(orderType === 'TAKEAWAY' ? styles.toggleActive : {}) }}
            onClick={() => setOrderType('TAKEAWAY')}
          >
            🛍️ Takeaway
          </button>
        </motion.div>

        {/* SEARCH & FILTERS */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={styles.filterBar}>
          <input
            type="text"
            placeholder="Search the menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.categoryScroller}>
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ ...styles.catPill, ...(selectedCategory === cat ? styles.catPillActive : {}) }}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- MENU GRID --- */}
      <motion.div style={styles.grid} initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id || product.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -5 }}
              style={styles.card}
            >
              <div style={styles.imageWrapper}>
                <img src={product.imageUrl} alt={product.name} style={styles.image} />
                {!product.isAvailable && <div style={styles.soldOutBadge}>Sold Out</div>}
              </div>

              <div style={styles.cardContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <span style={styles.price}>₹{product.price}</span>
                </div>

                <p style={styles.description}>{product.description || "Premium quality ingredients crafted to perfection."}</p>

                {role !== "admin" && role !== "manager" && (
                  <div style={styles.actionRow}>
                    {product.isAvailable !== false ? (
                      <>
                        <div style={styles.stepper}>
                          <button onClick={() => handleQuantityChange(product._id || product.id, -1, 99)} style={styles.stepBtn}>-</button>
                          <span style={styles.stepText}>{quantities[product._id || product.id] || 1}</span>
                          <button onClick={() => handleQuantityChange(product._id || product.id, 1, 99)} style={styles.stepBtn}>+</button>
                        </div>
                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          style={styles.addBtn}
                          whileTap={{ scale: 0.95 }}
                        >
                          Add +
                        </motion.button>
                      </>
                    ) : (
                      <button style={styles.disabledBtn} disabled>Currently Unavailable</button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Inline Styles for the Midnight & Flame Design System
const styles = {
  container: { backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '2rem', fontFamily: "'Inter', sans-serif" },
  heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', paddingTop: '2rem' },
  heroTitle: { fontSize: '3.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em', marginBottom: '2rem', textAlign: 'center' },

  toggleContainer: { display: 'flex', background: '#FFFFFF', padding: '6px', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  toggleBtn: { flex: 1, padding: '12px 32px', border: 'none', background: 'transparent', color: '#64748B', fontSize: '1rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  toggleActive: { background: '#FF5A00', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(255, 90, 0, 0.3)' },

  filterBar: { width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  searchInput: { width: '100%', padding: '16px 24px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', fontSize: '1rem', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  categoryScroller: { display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' },
  catPill: { padding: '8px 20px', borderRadius: '100px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
  catPillActive: { background: '#0F172A', color: '#FFFFFF', border: '1px solid #0F172A' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1400px', margin: '0 auto' },
  card: { background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)' },
  imageWrapper: { position: 'relative', width: '100%', paddingTop: '65%', backgroundColor: '#F1F5F9' },
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  soldOutBadge: { position: 'absolute', top: '12px', right: '12px', background: '#FFFFFF', color: '#EF4444', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },

  cardContent: { padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 },
  productName: { fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' },
  price: { fontSize: '1.25rem', fontWeight: 800, color: '#FF5A00' },
  description: { color: '#64748B', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 },

  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' },
  stepper: { display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' },
  stepBtn: { width: '36px', height: '36px', background: 'transparent', border: 'none', color: '#0F172A', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 600 },
  stepText: { width: '24px', textAlign: 'center', color: '#0F172A', fontWeight: 700 },
  addBtn: { flex: 1, padding: '12px', background: '#FF5A00', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 90, 0, 0.2)' },
  disabledBtn: { flex: 1, padding: '12px', background: '#F1F5F9', color: '#94A3B8', border: 'none', borderRadius: '8px', fontWeight: 700 }
};
