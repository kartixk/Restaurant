import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "./Sweets.css";
import { motion, AnimatePresence } from "framer-motion";

// Safe User Role Extractor
function getUserRole() {
  const token = localStorage.getItem("token");
  const directRole = localStorage.getItem("role");

  if (directRole) return directRole.toLowerCase();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role) return payload.role.toLowerCase();
    if (payload.isAdmin) return "admin";
    return "user";
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    return null;
  }
}

export default function Sweets() {
  const [sweets, setSweets] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const navigate = useNavigate();

  const role = getUserRole();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    `;
    document.head.appendChild(style);
    // eslint-disable-next-line react-hooks/immutability
    fetchSweets();
    return () => { document.head.removeChild(style); };
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await api.get("/sweets");
      // Sort Sweets Alphabetically (A-Z)
      const sortedSweets = res.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setSweets(sortedSweets);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error("Failed to fetch sweets");
      toast.error(" Failed to load sweets.");
    }
  };

  /* --- QUANTITY HANDLERS --- */
  const increaseQty = (sweetId, maxStock) => {
    const currentQty = quantities[sweetId] || 1;
    if (currentQty < maxStock) {
      setQuantities({ ...quantities, [sweetId]: currentQty + 1 });
    } else {
      toast.warning(` Max quantity is ${maxStock}`);
    }
  };

  const decreaseQty = (sweetId) => {
    const currentQty = quantities[sweetId] || 1;
    if (currentQty > 1) {
      setQuantities({ ...quantities, [sweetId]: currentQty - 1 });
    }
  };

  const handleQuantityChange = (sweetId, value, maxStock) => {
    const numValue = parseInt(value) || 1;
    if (numValue >= 1 && numValue <= maxStock) {
      setQuantities({ ...quantities, [sweetId]: numValue });
    } else if (numValue > maxStock) {
      setQuantities({ ...quantities, [sweetId]: maxStock });
    }
  };

  /* --- NEW: PDF GENERATOR FUNCTION --- */
  const generateSingleInvoice = (sweet, quantity) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Sweet Shop - Order Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Status: Paid (Instant Buy)`, 14, 36);

    const total = sweet.price * quantity;
    const tableColumn = ["Item Name", "Price (Rs)", "Qty", "Subtotal (Rs)"];
    const tableRows = [[
      sweet.name,
      sweet.price,
      quantity,
      total
    ]];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });

    const finalY = (doc.lastAutoTable?.finalY || 45) + 10;
    doc.setFontSize(14);
    doc.text(`Grand Total: Rs ${total}`, 14, finalY);

    doc.save(`Invoice_${sweet.name}_${Date.now()}.pdf`);
  };

  /* --- ACTION 1: ADD TO CART --- */
  const handleAddToCart = async (sweet) => {
    if (!role) {
      toast.warning(" Please login first");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const qtyToAdd = quantities[sweet._id] || 1;
    const loadingToast = toast.loading("⏳ Adding to cart...");

    try {
      await api.post("/cart/items", {
        sweetId: sweet._id,
        quantity: qtyToAdd,
      });

      toast.update(loadingToast, {
        render: ` Added ${qtyToAdd} ${sweet.name} to cart!`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      // Reset quantity input
      const newQuantities = { ...quantities };
      delete newQuantities[sweet._id];
      setQuantities(newQuantities);

    } catch (err) {
      handleError(err, loadingToast);
    }
  };

  /* --- ACTION 2: DIRECT PURCHASE --- */
  const handleFastBuy = async (sweet) => {
    if (!role) {
      toast.warning(" Please login first");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const qtyToBuy = quantities[sweet._id] || 1;
    const loadingToast = toast.loading("⚡ Processing purchase...");

    try {
      //  FIX APPLIED HERE: Using /cart/buy-now
      await api.post("/cart/buy-now", {
        sweetId: sweet._id,
        quantity: qtyToBuy
      });

      toast.update(loadingToast, {
        render: "Order placed successfully! Downloading Invoice... 🎉",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // --- GENERATE PDF HERE ---
      generateSingleInvoice(sweet, qtyToBuy);
      // ------------------------

      fetchSweets(); // Refresh stock

      const newQuantities = { ...quantities };
      delete newQuantities[sweet._id];
      setQuantities(newQuantities);

    } catch (err) {
      //  Error Handling for Buy Now
      console.error(err);
      const errorMsg = err.response?.data?.message || "Buy now failed";

      toast.update(loadingToast, {
        render: ` ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    }
  };

  /* --- SHARED ERROR HANDLER --- */
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
        render: ` ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      if (errorMsg.toLowerCase().includes("stock")) fetchSweets();
    }
  };

  // --- CLEAN CATEGORY HELPER ---
  const getCleanCategory = (category) => {
    if (!category) return "";
    return category
      .toUpperCase()
      .replace(/\s*SWEETS?\s*/g, "")
      .trim();
  };

  // --- FILTER LOGIC ---
  const uniqueCategories = [...new Set(sweets.map(s => getCleanCategory(s.category)))];
  uniqueCategories.sort();
  const categories = ["ALL", ...uniqueCategories];

  const filteredSweets = sweets.filter(sweet => {
    const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const currentCategory = getCleanCategory(sweet.category);
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
      {/* ToastContainer placed here for specific page notifications */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Search and Filter */}
      <motion.div
        className="filter-section"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="search-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search for sweets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sweets Grid */}
      <motion.div
        className="sweets-grid"
      >

        <AnimatePresence>
          {filteredSweets.map((sweet) => (
            <motion.div
              key={sweet._id}
              className="sweet-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.2 }}
              whileHover={{
                y: -8,
                boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="card-image-wrapper">
                <img
                  src={sweet.imageUrl || "https://placehold.co/300x200?text=No+Image"}
                  alt={sweet.name}
                  className="card-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x200?text=Image+Not+Found";
                  }}
                />

                {sweet.quantity === 0 && (
                  <div className="out-of-stock-badge">Out of Stock</div>
                )}
              </div>

              <div className="card-content">
                <div className="card-header">
                  <h3 className="sweet-name">{sweet.name}</h3>
                  <span className="category-tag">{getCleanCategory(sweet.category)}</span>
                </div>

                <div className="card-details">
                  <span className="price-tag">
                    ₹{sweet.price} <span className="price-unit">/ 250g</span>
                  </span>

                  <div className={`stock-status ${sweet.quantity === 0 ? 'out-stock' :
                    sweet.quantity < 10 ? 'low-stock' : 'in-stock'
                    }`}>
                    {sweet.quantity > 0 ? `${sweet.quantity} in stock` : "Sold Out"}
                  </div>
                </div>

                {role !== "admin" && (
                  <div className="action-section">
                    {!role ? (
                      <button onClick={() => navigate("/login")} className="login-message-btn">
                        Login to Order
                      </button>
                    ) : (
                      <>
                        {sweet.quantity > 0 ? (
                          <div className="purchase-controls">
                            <div className="quantity-wrapper">
                              <button onClick={() => decreaseQty(sweet._id)} className="qty-btn">-</button>
                              <input
                                type="number"
                                value={quantities[sweet._id] || 1}
                                onChange={(e) => handleQuantityChange(sweet._id, e.target.value, sweet.quantity)}
                                className="qty-input"
                              />
                              <button onClick={() => increaseQty(sweet._id, sweet.quantity)} className="qty-btn">+</button>
                            </div>

                            <div className="button-group">
                              <motion.button
                                onClick={() => handleAddToCart(sweet)}
                                className="btn-add-cart"
                                whileTap={{ scale: 0.95 }}
                              >
                                Add to Cart
                              </motion.button>

                              <motion.button
                                onClick={() => handleFastBuy(sweet)}
                                className="btn-buy-now"
                                whileTap={{ scale: 0.95 }}
                              >
                                Buy Now
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          <button className="unavailable-btn" disabled>
                            Unavailable
                          </button>
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
