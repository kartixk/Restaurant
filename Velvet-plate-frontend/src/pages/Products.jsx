import { useState, useMemo, memo, useEffect } from "react";
import { useProducts } from "../hooks/useProducts";
import { useAddToCart } from "../hooks/useCart";
import useAuthStore from "../store/useAuthStore";
import useCartStore from "../store/useCartStore";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import useLocationStore from "../store/useLocationStore";
import LocationPickerModal from "../components/LocationPickerModal";
import { MapPin, Search, ShoppingBag, X, ChevronDown, Minus, Plus } from "lucide-react";

/* ══════════════════════════════════════════════
   VELVET PLATE  ·  Menu Page Refresh
══════════════════════════════════════════════ */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Outfit:wght@300;400;500;600;700&display=swap');

    :root {
      --bg: #FAEEE0;
      --bg-alt: #F2E3CE;
      --primary: #E8581A;
      --primary-hover: #C44610;
      --text-dark: #1C1208;
      --text-muted: #8A6A4E;
      --border: rgba(28, 18, 8, 0.08);
      --card-bg: #FFFFFF;
      --veg: #268A47;
      --nonveg: #C0392B;
      --shadow-sm: 0 4px 12px rgba(28, 18, 8, 0.04);
      --shadow-md: 0 12px 32px rgba(28, 18, 8, 0.06);
    }

    body { background: var(--bg); color: var(--text-dark); -webkit-font-smoothing: antialiased; }
    .serif { font-family: 'Playfair Display', serif; }
    .sans { font-family: 'Outfit', sans-serif; }

    /* Layout & Utilities */
    .container { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
    .hide-scroll::-webkit-scrollbar { display: none; }
    .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

    /* Inputs & Buttons */
    .search-input {
      width: 100%; max-width: 400px;
      padding: 14px 20px 14px 50px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      font-size: 15px; color: var(--text-dark);
      transition: all 0.3s ease;
      box-shadow: var(--shadow-sm);
    }
    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(232, 88, 26, 0.1);
    }
    .search-input::placeholder { color: var(--text-muted); opacity: 0.7; }

    .category-pill {
      padding: 12px 28px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text-muted);
      font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
      cursor: pointer; white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
    }
    .category-pill:hover { border-color: var(--primary); color: var(--primary); }
    .category-pill.active {
      background: var(--primary); color: #fff; border-color: var(--primary);
      box-shadow: 0 8px 20px rgba(232, 88, 26, 0.25);
    }

    /* Product Card */
    .product-card {
      background: var(--card-bg);
      border-radius: 20px;
      border: 1px solid var(--border);
      overflow: hidden;
      display: flex; flex-direction: column;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-sm);
    }
    .product-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-md);
      border-color: rgba(232, 88, 26, 0.2);
    }
    
    .card-img-wrap {
      position: relative; height: 260px; overflow: hidden;
      background: var(--bg-alt);
    }
    .card-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-card:hover .card-img { transform: scale(1.05); }

    .card-body { padding: 24px 24px 28px; display: flex; flex-direction: column; flex: 1; }
    
    .card-title {
      font-size: 26px; font-weight: 800; line-height: 1.1; letter-spacing: -0.01em;
      margin-bottom: 10px; color: var(--text-dark);
    }
    .card-desc {
      font-size: 14px; line-height: 1.6; color: var(--text-muted); font-weight: 400;
      margin-bottom: 24px; flex-grow: 1;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .diet-badge {
      position: absolute; top: 16px; left: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 10px;
      background: rgba(255,255,255,0.95); backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .diet-dot { width: 12px; height: 12px; border-radius: 50%; }

    /* Controls */
    .add-btn {
      width: 100%; padding: 16px; border-radius: 12px; border: none;
      background: var(--primary); color: #fff;
      font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(232, 88, 26, 0.2);
    }
    .add-btn:hover { background: var(--primary-hover); box-shadow: 0 6px 20px rgba(232, 88, 26, 0.3); }
    .add-btn:active { transform: scale(0.98); }

    .qty-control {
      display: flex; align-items: center; gap: 4px;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 100px; padding: 4px;
    }
    .qty-btn {
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: transparent; color: var(--text-dark);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      transition: all 0.2s;
    }
    .qty-btn:hover { background: var(--primary); color: #fff; }
    .qty-val { width: 32px; text-align: center; font-size: 16px; font-weight: 700; color: var(--text-dark); }

    /* Header elements */
    .location-selector {
      display: inline-flex; align-items: center; gap: 12px; padding: 10px 24px;
      background: var(--card-bg); border: 1px solid var(--border); border-radius: 100px;
      cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.3s;
    }
    .location-selector:hover { border-color: var(--primary); box-shadow: var(--shadow-md); transform: translateY(-2px); }

    @media (max-width: 768px) {
      .container { padding: 0 24px; }
      .search-input { max-width: 100%; }
    }
  `}</style>
);

const SkeletonCard = () => (
  <div className="product-card" style={{ pointerEvents: 'none' }}>
    <div className="card-img-wrap" style={{ background: 'var(--bg-alt)' }} />
    <div className="card-body">
      <div style={{ height: 28, background: 'var(--bg-alt)', borderRadius: 6, width: '70%', marginBottom: 16 }} />
      <div style={{ height: 16, background: 'var(--bg-alt)', borderRadius: 6, width: '100%', marginBottom: 8 }} />
      <div style={{ height: 16, background: 'var(--bg-alt)', borderRadius: 6, width: '60%', marginBottom: 32 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ height: 32, background: 'var(--bg-alt)', borderRadius: 6, width: 80 }} />
        <div style={{ height: 44, background: 'var(--bg-alt)', borderRadius: 100, width: 120 }} />
      </div>
      <div style={{ height: 50, background: 'var(--bg-alt)', borderRadius: 12, width: '100%' }} />
    </div>
  </div>
);

const ProductCard = memo(({ product, role, quantities, handleQuantityChange, handleAddToCart, index }) => {
  const id = product._id || product.id;
  const qty = quantities?.[id] || 1;
  const isVeg = product.dietType === "Veg";
  const isNonVeg = product.dietType === "Non Veg";
  const canOrder = role !== "admin" && role !== "manager" && product.isAvailable;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="product-card sans"
    >
      <div className="card-img-wrap">
        <img className="card-img" src={product.imageUrl} alt={product.name} loading="lazy" />
        
        {(isVeg || isNonVeg) && (
          <div className="diet-badge" title={product.dietType}>
            <div className="diet-dot" style={{ background: isVeg ? 'var(--veg)' : 'var(--nonveg)' }} />
          </div>
        )}

        {!product.isAvailable && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(250,238,224,0.85)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>
            <span style={{
              background: '#fff', padding: '10px 24px', borderRadius: 100, fontSize: 13,
              fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)',
              border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(28, 18, 8, 0.08)'
            }}>Sold Out</span>
          </div>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title serif">{product.name}</h3>
        <p className="card-desc">{product.description || "Chef-crafted from premium, locally sourced ingredients — prepared fresh to order."}</p>
        
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>Total</span>
            <div className="sans" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₹{product.price * qty}
            </div>
          </div>

          {canOrder && (
            <div className="qty-control">
              <button className="qty-btn" onClick={() => handleQuantityChange(id, -1, 99)}><Minus size={16} strokeWidth={2.5} /></button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => handleQuantityChange(id, 1, 99)}><Plus size={16} strokeWidth={2.5} /></button>
            </div>
          )}
        </div>

        {canOrder && (
          <motion.button 
            whileTap={{ scale: 0.97 }}
            className="add-btn sans" 
            onClick={() => handleAddToCart(product)}
          >
            <ShoppingBag size={18} strokeWidth={2.5} /> Add to Cart
          </motion.button>
        )}
      </div>
    </motion.div>
  );
});

export default function Products() {
  const { selectedBranchId, selectedBranchName, selectedCity } = useLocationStore();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => { if (!selectedBranchId) setIsLocationModalOpen(true); }, [selectedBranchId]);

  const { data: productsData = [], isLoading } = useProducts(selectedBranchId);
  const { quantities, setQuantity } = useCartStore();
  const { mutate: addToCart } = useAddToCart();

  const handleQuantityChange = (id, delta, max) =>
    setQuantity(id, Math.max(1, Math.min(max, (quantities[id] || 1) + delta)));

  const handleAddToCart = (product) => {
    const id = product._id || product.id;
    const qty = quantities[id] || 1;
    
    addToCart(
      { productId: id, quantity: qty },
      {
        onSuccess: () => { toast.success(`${qty}x ${product.name} added to cart`); setQuantity(id, 1); },
        onError: (err) => toast.error(err?.response?.data?.message || "Couldn't add item")
      }
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const role = useAuthStore.getState().role?.toLowerCase();

  const categories = useMemo(
    () => ["ALL", ...new Set(productsData.map(p => p.category?.toUpperCase()))].filter(Boolean),
    [productsData]
  );

  const filteredProducts = useMemo(() =>
    productsData.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "ALL" || p.category?.toUpperCase() === selectedCategory)
    ),
    [productsData, searchTerm, selectedCategory]
  );

  return (
    <>
      <Styles />
      <ToastContainer position="bottom-right" closeButton={false} hideProgressBar={true} toastStyle={{ borderRadius: 16, boxShadow: '0 12px 32px rgba(28, 18, 8, 0.08)', border: '1px solid var(--border)', fontFamily: 'Outfit, sans-serif' }} />

      <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
        
        {/* Header Section */}
        <section style={{ padding: '80px 0 32px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Top row: Title + Location */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
                Our <span style={{ color: 'var(--primary)', fontStyle: 'italic' }}>Signature</span> Menu
              </h1>

              <div 
                className="location-selector sans" 
                onClick={() => setIsLocationModalOpen(true)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,88,26,0.1)', color: 'var(--primary)' }}>
                  <MapPin size={16} />
                </div>
                <div style={{ textAlign: 'left', marginRight: 4 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Location</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dark)', fontWeight: 700 }}>{selectedBranchName || "Select Branch"}</div>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="hide-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, flex: 1 }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`sans category-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
                <Search size={20} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="search-input sans"
                  placeholder="Search for your favorite dish..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 56, fontSize: 15 }}
                />
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchTerm("")}
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'var(--border)', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dark)' }}
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container" style={{ paddingTop: 48 }}>
           <AnimatePresence mode="wait">
             {!isLoading && (
                <motion.div 
                  key={`${selectedCategory}-${searchTerm}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="sans"
                  style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
                </motion.div>
             )}
           </AnimatePresence>

           <AnimatePresence mode="popLayout">
             <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
               {isLoading
                 ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                 : filteredProducts.length === 0
                   ? (
                     <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 0' }}>
                        <div style={{ fontSize: 56, marginBottom: 20 }}>🍽️</div>
                        <h3 className="serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 12 }}>Nothing on the menu</h3>
                        <p className="sans" style={{ color: 'var(--text-muted)', fontSize: 16 }}>We couldn't find any dishes matching your current selection.</p>
                        <button 
                          className="sans"
                          onClick={() => { setSearchTerm(""); setSelectedCategory("ALL"); }}
                          style={{ marginTop: 24, background: 'var(--border)', border: 'none', padding: '12px 28px', borderRadius: 100, fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}
                        >
                          Clear Filters
                        </button>
                     </div>
                   )
                   : filteredProducts.map((product, i) => (
                     <ProductCard
                       key={product._id || product.id}
                       product={product} role={role}
                       quantities={quantities}
                       handleQuantityChange={handleQuantityChange}
                       handleAddToCart={handleAddToCart}
                       index={i}
                     />
                   ))
               }
             </motion.div>
           </AnimatePresence>
        </section>
      </div>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        forceSelection={!selectedBranchId}
      />
    </>
  );
}
