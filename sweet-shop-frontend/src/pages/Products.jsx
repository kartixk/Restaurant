import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useProducts } from "../hooks/useProducts";
import { useAddToCart, useFastBuy } from "../hooks/useCart";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "./Products.css";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const { data: productsData = [], error: productsError, refetch: refetchProducts } = useProducts(selectedBranch);
  const addToCartMutation = useAddToCart();
  const fastBuyMutation = useFastBuy();

  const quantities = useCartStore((state) => state.quantities);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearQuantity = useCartStore((state) => state.clearQuantity);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const navigate = useNavigate();

  const { isAuthenticated, role: upperRole } = useAuthStore();
  const role = upperRole ? upperRole.toLowerCase() : null;

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
input[type = "number"]:: -webkit - inner - spin - button,
  input[type = "number"]:: -webkit - outer - spin - button {
  -webkit - appearance: none;
  margin: 0;
}
input[type = "number"] {
  -moz - appearance: textfield;
}
`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const products = [...productsData].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (productsError) {
      console.error("Failed to fetch products", productsError);
      toast.error(" Failed to load menu items.");
    }
  }, [productsError]);

  /* --- QUANTITY HANDLERS --- */
  const increaseQty = (productId, maxStock) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty < maxStock) {
      setQuantity(productId, currentQty + 1);
    } else {
      toast.warning(` Max quantity is ${maxStock} `);
    }
  };

  const decreaseQty = (productId) => {
    const currentQty = quantities[productId] || 1;
    if (currentQty > 1) {
      setQuantity(productId, currentQty - 1);
    }
  };

  const handleQuantityChange = (productId, value, maxStock) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= maxStock) {
      setQuantity(productId, numValue);
    } else if (numValue > maxStock) {
      setQuantity(productId, maxStock);
    }
  };

  /* --- NEW: PDF GENERATOR FUNCTION --- */
  const generateSingleInvoice = (product, quantity) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("FoodFlow - Order Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()} `, 14, 30);
    doc.text(`Branch: ${product.branchName || "Main"}`, 14, 36);
    doc.text(`Status: Paid (Instant Buy)`, 14, 42);

    const total = product.price * quantity;
    const tableColumn = ["Item Name", "Price (Rs)", "Qty", "Subtotal (Rs)"];
    const tableRows = [[
      product.name,
      product.price,
      quantity,
      total
    ]];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    const finalY = (doc.lastAutoTable?.finalY || 50) + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: Rs ${total}`, 14, finalY);

    doc.save(`Invoice_${Date.now()}.pdf`);
  };

  const handleFastBuy = (product) => {
    const qty = quantities[product.id || product._id] || 1;
    if (!isAuthenticated) return navigate("/login");
    if (role === 'admin') return toast.warning(" Admins cannot buy items! ");

    fastBuyMutation.mutate({ productId: product.id || product._id, quantity: qty }, {
      onSuccess: () => {
        toast.success(` Bought ${qty} ${product.name}(s)! Downloading Invoice... ✨ `);
        generateSingleInvoice(product, qty);
        clearQuantity(product.id || product._id);
      },
      onError: (err) => {
        console.error(err);
        toast.error(err.response?.data?.message || " Purchase failed.");
      }
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id || product._id] || 1;
    if (!isAuthenticated) return navigate("/login");
    if (role === 'admin') return toast.warning(" Admins cannot add items! ");

    addToCartMutation.mutate({ productId: product.id || product._id, quantity: qty }, {
      onSuccess: () => {
        toast.success(` ${qty} ${product.name} added to cart! 🛒 `);
        clearQuantity(product.id || product._id);
      },
      onError: (err) => {
        console.error(err);
        toast.error(err.response?.data?.message || " Failed to add to cart.");
      }
    });
  };

  const handleError = (err, toastId) => {
    console.error(err);
    const errorMsg = err.response?.data?.message || "Action failed";

    if (err.response?.status === 401 || err.response?.status === 403) {
      toast.update(toastId, {
        render: " Session expired. Login required.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 1500);
    } else {
      toast.update(toastId, {
        render: ` ${errorMsg} `,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      if (errorMsg.toLowerCase().includes("stock")) refetchProducts();
    }
  };

  const getCleanCategory = (category) => {
    if (!category) return "";
    return category.toUpperCase().trim();
  };

  const uniqueCategories = [...new Set(products.map(s => getCleanCategory(s.category)))];
  uniqueCategories.sort();
  const categories = ["ALL", ...uniqueCategories];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const currentCategory = getCleanCategory(product.category);
    const matchesCategory = selectedCategory === "ALL" || currentCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      className="sweets-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <section className="hero-section">
        <div className="hero-background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>

        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Explore Our Fine Dining Menu
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Savor the flavors from our various branches.
          </motion.p>

          <motion.div
            className="search-glass-container"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="search-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="catalog-header">
        <h2 className="section-title">Menu Highlights</h2>
        <span className="results-count">Showing {filteredProducts.length} items</span>
      </div>

      <motion.div
        className="sweets-grid"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              className="sweet-card"
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="card-image-wrapper">
                <img
                  src={product.imageUrl || "https://placehold.co/300x200?text=No+Image"}
                  alt={product.name}
                  className="card-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200?text=Image+Not+Found"; }}
                />
                {product.quantity === 0 && <div className="out-of-stock-badge">Sold Out</div>}
                <div className="image-overlay"></div>
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h3 className="sweet-name">{product.name}</h3>
                  <span className="category-tag">{getCleanCategory(product.category)}</span>
                </div>

                <div className="branch-tag" style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '600', marginBottom: '8px' }}>
                  📍 {product.branchName || "Main Branch"}
                </div>

                <div className="card-details">
                  <span className="price-tag">₹{product.price}</span>
                  <div className={`stock-status ${product.quantity === 0 ? 'out-stock' : product.quantity < 10 ? 'low-stock' : 'in-stock'}`}>
                    {product.quantity > 0 ? `${product.quantity} available` : "Unavailable"}
                  </div>
                </div>

                {role !== "admin" && (
                  <div className="action-section">
                    {!role ? (
                      <button onClick={() => navigate("/login")} className="login-message-btn">Login to Order</button>
                    ) : (
                      <>
                        {product.quantity > 0 ? (
                          <div className="purchase-controls">
                            <div className="quantity-wrapper">
                              <button onClick={() => decreaseQty(product._id)} className="qty-btn">-</button>
                              <input
                                type="number"
                                value={quantities[product._id] || 1}
                                onChange={(e) => handleQuantityChange(product._id, e.target.value, product.quantity)}
                                className="qty-input"
                              />
                              <button onClick={() => increaseQty(product._id, product.quantity)} className="qty-btn">+</button>
                            </div>

                            <div className="button-group">
                              <motion.button onClick={() => handleAddToCart(product)} className="btn-add-cart" whileTap={{ scale: 0.95 }}>Add to Cart</motion.button>
                              <motion.button onClick={() => handleFastBuy(product)} className="btn-buy-now" whileTap={{ scale: 0.95 }}>Order Now</motion.button>
                            </div>
                          </div>
                        ) : (
                          <button className="unavailable-btn" disabled>Currently Unavailable</button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
