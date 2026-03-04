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
    <div className="bg-slate-50 min-h-screen p-6 md:p-12 font-sans">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      {/* --- PREMIUM HERO SECTION --- */}
      <section className="flex flex-col items-center mb-16 pt-8">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-10 text-center leading-[0.9] max-w-2xl"
        >
          Crave It. <span className="text-orange-600 block md:inline">Order It.</span>
        </motion.h1>

        {/* QSR ORDER TYPE TOGGLE */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex bg-white p-1.5 rounded-2xl mb-12 border border-slate-200 shadow-sm"
        >
          <button
            className={`flex-1 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${orderType === 'DINE_IN'
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                : "text-slate-500 hover:text-slate-700"
              }`}
            onClick={() => setOrderType('DINE_IN')}
          >
            🍽️ Dine-in
          </button>
          <button
            className={`flex-1 px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${orderType === 'TAKEAWAY'
                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                : "text-slate-500 hover:text-slate-700"
              }`}
            onClick={() => setOrderType('TAKEAWAY')}
          >
            🛍️ Takeaway
          </button>
        </motion.div>

        {/* SEARCH & FILTERS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-5xl flex flex-col gap-6"
        >
          <div className="relative group">
            <input
              type="text"
              placeholder="Search our delicious menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-8 py-5 rounded-[2rem] bg-white border border-slate-200 text-slate-900 text-lg outline-none shadow-sm focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full border font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                    ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-950/20"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- MENU GRID --- */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] margin-0-auto"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
      >
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id || product.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 flex flex-col shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 group"
            >
              <div className="relative aspect-[16/11] bg-slate-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {!product.isAvailable && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                    Sold Out
                  </div>
                )}
                {product.dietType && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-1.5 rounded-lg shadow-xl ring-1 ring-black/5">
                    <div className={`w-3.5 h-3.5 border ${product.dietType === 'Veg' ? 'border-emerald-600' : product.dietType === 'Non-Veg' ? 'border-red-600' : 'border-amber-600'
                      } rounded-sm p-[1.5px] flex items-center justify-center`}>
                      <div className={`w-full h-full rounded-full ${product.dietType === 'Veg' ? 'bg-emerald-600' : product.dietType === 'Non-Veg' ? 'bg-red-600' : 'bg-amber-600'
                        }`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-xl font-black text-slate-950 tracking-tight leading-tight m-0">{product.name}</h3>
                  <span className="text-xl font-black text-orange-600 leading-none">₹{product.price}</span>
                </div>

                <p className="text-slate-400 font-medium text-xs leading-relaxed mb-8 flex-1">
                  {product.description || "Premium quality ingredients crafted to perfection with our signature house style."}
                </p>

                {role !== "admin" && role !== "manager" && (
                  <div className="flex justify-between items-center gap-4 mt-auto">
                    {product.isAvailable !== false ? (
                      <>
                        <div className="flex items-center bg-slate-50 p-1.5 rounded-xl ring-1 ring-slate-100 ring-inset">
                          <button
                            onClick={() => handleQuantityChange(product._id || product.id, -1, 99)}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg font-black transition-all text-xl"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-slate-950 font-black text-sm">{quantities[product._id || product.id] || 1}</span>
                          <button
                            onClick={() => handleQuantityChange(product._id || product.id, 1, 99)}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg font-black transition-all text-xl"
                          >
                            +
                          </button>
                        </div>
                        <motion.button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 whitespace-nowrap"
                          whileTap={{ scale: 0.95 }}
                        >
                          Add to Cart
                        </motion.button>
                      </>
                    ) : (
                      <button className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest cursor-not-allowed" disabled>
                        Out of Stock
                      </button>
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
