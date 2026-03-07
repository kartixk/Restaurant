// src/pages/Landing.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import {
    ChevronRight, Star, Clock, MapPin, Utensils, Flame, Sparkles,
    ArrowRight, Shield, Zap, Heart, Menu, X
} from "lucide-react";

// ─── Google Font import via style tag ─────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700;800;900&display=swap";
fontLink.rel = "stylesheet";
if (!document.head.querySelector("[href*='Playfair']")) document.head.appendChild(fontLink);

// ─── Floating particle ────────────────────────────────────────────────────────
function Particle({ style }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={style}
            animate={{ y: [0, -30, 0], x: [0, 10, 0], opacity: [0.1, 0.35, 0.1] }}
            transition={{ duration: Math.random() * 4 + 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
        />
    );
}

// ─── Animated counter — re-triggers every scroll ─────────────────────────────
function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });
    useEffect(() => {
        if (!isInView) { setCount(0); return; }
        let start = 0;
        const step = target / (1600 / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, target]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── FadeIn wrapper — re-animates every time element enters viewport ──────────
function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-50px", amount: 0.15 });
    const initial = {
        up: { opacity: 0, y: 36 },
        down: { opacity: 0, y: -36 },
        left: { opacity: 0, x: -36 },
        right: { opacity: 0, x: 36 },
    }[direction];
    const visible = direction === "up" || direction === "down"
        ? { opacity: 1, y: 0 }
        : { opacity: 1, x: 0 };
    return (
        <motion.div ref={ref} className={className}
            initial={initial}
            animate={isInView ? visible : initial}
            transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { img: "/food/burger.png", label: "Burgers", desc: "Handcrafted patties", color: "#92400e" },
    { img: "/food/pizza.png", label: "Pizza", desc: "Stone-baked perfection", color: "#991b1b" },
    { img: "/food/pasta.png", label: "Pasta", desc: "Al dente classics", color: "#78350f" },
    { img: "/food/salad.png", label: "Salads", desc: "Garden fresh bowls", color: "#14532d" },
    { img: "/food/sushi.png", label: "Sushi", desc: "Artful Japanese rolls", color: "#1e293b" },
    { img: "/food/dessert.png", label: "Desserts", desc: "Sweet indulgences", color: "#831843" },
];

const TESTIMONIALS = [
    { name: "Priya Sharma", role: "Food Blogger", avatar: "PS", color: "from-violet-500 to-purple-600", rating: 5, text: "Velvet Plate completely changed how I experience dining. The food quality is unmatched and the ordering process is seamless." },
    { name: "Arjun Mehta", role: "Tech Entrepreneur", avatar: "AM", color: "from-orange-500 to-red-500", rating: 5, text: "I order from Velvet Plate at least 3 times a week. The consistency of quality and speed of service is remarkable." },
    { name: "Neha Patel", role: "Chef & Influencer", avatar: "NP", color: "from-pink-500 to-rose-600", rating: 5, text: "As someone with a refined palate, I can honestly say Velvet Plate sets the gold standard for premium dining experiences." },
];

const ROLLING_WORDS = [
    { text: "Tells a Story", gradient: "linear-gradient(135deg, #FF5A00, #f59e0b)" },
    { text: "Creates Magic", gradient: "linear-gradient(135deg, #D4A853, #FF5A00)" },
    { text: "Sparks Joy", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    { text: "Brings Delight", gradient: "linear-gradient(135deg, #FF5A00, #D4A853)" },
    { text: "Feels Like Home", gradient: "linear-gradient(135deg, #c2410c, #f59e0b)" },
];

const NAV_LINKS = ["Menu", "About", "Locations", "Contact"];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Landing() {
    const navigate = useNavigate();
    const heroRef = useRef(null);
    const { scrollY } = useScroll();
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [activeWord, setActiveWord] = useState(0);
    const [navScrolled, setNavScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4200);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const wt = setInterval(() => setActiveWord(p => (p + 1) % ROLLING_WORDS.length), 3800);
        return () => clearInterval(wt);
    }, []);

    useEffect(() => {
        return scrollY.on("change", v => setNavScrolled(v > 40));
    }, [scrollY]);

    const particles = [
        { width: 6, height: 6, background: "#FF5A00", top: "15%", left: "6%", filter: "blur(1px)", opacity: 0.4 },
        { width: 10, height: 10, background: "#D4A853", top: "20%", right: "8%", filter: "blur(2px)", opacity: 0.35 },
        { width: 5, height: 5, background: "#f97316", top: "65%", left: "4%", filter: "blur(1px)", opacity: 0.3 },
        { width: 8, height: 8, background: "#D4A853", top: "70%", right: "6%", filter: "blur(2px)", opacity: 0.3 },
    ];

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }} className="bg-white min-h-screen overflow-x-hidden">

            {/* ═══ NAVBAR ═══ */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
                animate={navScrolled
                    ? { backgroundColor: "rgba(255,255,255,0.96)", boxShadow: "0 2px 32px rgba(0,0,0,0.08)" }
                    : { backgroundColor: "rgba(255,255,255,0)", boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-18 py-4">
                    {/* Logo wordmark */}
                    <motion.div
                        className="flex items-center gap-2.5 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate("/")}
                    >
                        <img
                            src="/Velvet_Plate_v2.png"
                            alt="Velvet Plate"
                            className="w-10 h-10 object-contain"
                            style={{ filter: "drop-shadow(0 2px 8px rgba(255,90,0,0.25))" }}
                        />
                        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.25rem", color: "#1a1a1a", letterSpacing: "-0.01em" }}>
                            Velvet Plate
                        </span>
                    </motion.div>

                    {/* Desktop nav links — with animated underline */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map(link => (
                            <motion.button
                                key={link}
                                onClick={() => link === "Menu" ? navigate("/menu") : null}
                                className="relative text-sm font-medium text-slate-600 tracking-wide group"
                                whileHover={{ color: "#FF5A00" }}
                                transition={{ duration: 0.2 }}
                            >
                                {link}
                                <motion.span
                                    className="absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-orange-500"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: "100%" }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                />
                            </motion.button>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <motion.button
                            onClick={() => navigate("/login")}
                            whileHover={{ color: "#FF5A00" }}
                            className="text-sm font-semibold text-slate-700 px-4 py-2 transition-colors"
                        >
                            Sign In
                        </motion.button>
                        <motion.button
                            onClick={() => navigate("/menu")}
                            whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(255,90,0,0.30)" }}
                            whileTap={{ scale: 0.97 }}
                            className="px-6 py-2.5 rounded-full text-sm font-bold text-white uppercase tracking-wider"
                            style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}
                        >
                            Order Now
                        </motion.button>
                    </div>

                    {/* Mobile hamburger */}
                    <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(o => !o)}>
                        {mobileMenuOpen ? <X size={22} className="text-slate-800" /> : <Menu size={22} className="text-slate-800" />}
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22 }}
                            className="md:hidden bg-white border-t border-slate-100 px-6 py-5 space-y-4 shadow-xl"
                        >
                            {NAV_LINKS.map(link => (
                                <button key={link} onClick={() => { link === "Menu" && navigate("/menu"); setMobileMenuOpen(false); }}
                                    className="block w-full text-left text-base font-semibold text-slate-700 py-2 border-b border-slate-50">{link}</button>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => navigate("/login")} className="flex-1 py-3 rounded-full border border-slate-200 text-sm font-bold text-slate-700">Sign In</button>
                                <button onClick={() => navigate("/menu")} className="flex-1 py-3 rounded-full text-white text-sm font-bold" style={{ background: "linear-gradient(135deg,#FF5A00,#f97316)" }}>Order Now</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* ═══ HERO ═══ */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Background — warm ivory gradient */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #fffbf5 0%, #fff8ee 30%, #fef3e8 60%, #fff5f0 100%)" }} />

                {/* Subtle radial glows */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(ellipse at 15% 50%, rgba(255,90,0,0.07) 0%, transparent 55%),
                                      radial-gradient(ellipse at 85% 20%, rgba(212,168,83,0.08) 0%, transparent 50%),
                                      radial-gradient(ellipse at 55% 90%, rgba(249,115,22,0.05) 0%, transparent 50%)`
                }} />

                {/* Fine dot grid */}
                <div className="absolute inset-0 opacity-[0.3]" style={{ backgroundImage: "radial-gradient(circle, #d6b896 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                {/* Floating particles */}
                {particles.map((p, i) => <Particle key={i} style={p} />)}

                {/* Soft glow orbs */}
                <motion.div className="absolute top-1/3 left-1/5 w-[520px] h-[520px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(255,90,0,0.06) 0%, transparent 70%)" }}
                    animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)" }}
                    animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />

                {/* Content */}
                <motion.div style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto pt-24"
                >
                    {/* Premium badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex items-center gap-2 px-5 py-2 rounded-full mb-10 border"
                        style={{ background: "rgba(255,90,0,0.06)", borderColor: "rgba(255,90,0,0.18)" }}
                    >
                        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                            <Flame size={13} className="text-orange-500" />
                        </motion.span>
                        <span className="text-orange-700 text-[11px] font-bold uppercase tracking-[0.22em]">Premium Dining Experience</span>
                    </motion.div>

                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <motion.img
                            src="/Velvet_Plate_v2.png"
                            alt="Velvet Plate"
                            className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto mb-6 cursor-pointer"
                            style={{ filter: "drop-shadow(0 12px 36px rgba(255,90,0,0.28)) drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                            whileHover={{
                                scale: 1.12,
                                filter: "drop-shadow(0 18px 48px rgba(255,90,0,0.45)) drop-shadow(0 4px 12px rgba(0,0,0,0.12))",
                                rotate: [0, -3, 3, 0],
                                transition: { duration: 0.4, ease: "easeOut" }
                            }}
                            whileTap={{ scale: 0.95 }}
                        />
                    </motion.div>

                    {/* Brand wordmark */}
                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="mb-3"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2.6rem, 6vw, 5rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                            lineHeight: 1,
                            background: "linear-gradient(135deg, #92400e 0%, #D4A853 40%, #f59e0b 65%, #92400e 100%)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            animation: "goldShimmer 5s linear infinite",
                        }}
                    >
                        Velvet Plate
                    </motion.h2>

                    {/* Rolling headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mb-6"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
                            fontWeight: 400,
                            fontStyle: "italic",
                            color: "#1c1917",
                            letterSpacing: "-0.01em",
                            lineHeight: 1.15,
                        }}
                    >
                        Where Every Bite
                        <span className="block relative" style={{ height: "1.4em", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={activeWord}
                                    initial={{ y: 28, opacity: 0, filter: "blur(6px)" }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ y: -22, opacity: 0, filter: "blur(6px)" }}
                                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                                    className="inline-block absolute whitespace-nowrap not-italic font-bold"
                                    style={{ background: ROLLING_WORDS[activeWord].gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Playfair Display', serif" }}
                                >
                                    {ROLLING_WORDS[activeWord].text}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </motion.h1>

                    {/* Sub-headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.52 }}
                        className="text-stone-500 text-lg md:text-xl font-light max-w-xl mb-10 leading-relaxed"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        Curated menus. Chef-quality dishes. Delivered to your table or ready for takeaway — with the premium touch you deserve.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.64 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                    >
                        <motion.button
                            onClick={() => navigate("/menu")}
                            whileHover={{ scale: 1.04, boxShadow: "0 18px 52px rgba(255,90,0,0.30)" }}
                            whileTap={{ scale: 0.97 }}
                            className="group flex items-center gap-3 px-10 py-4 rounded-full font-bold text-white text-sm uppercase tracking-widest shadow-lg shadow-orange-500/20"
                            style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}
                        >
                            <Utensils size={16} />
                            Explore Menu
                            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <ChevronRight size={16} />
                            </motion.span>
                        </motion.button>

                        <motion.button
                            onClick={() => navigate("/login")}
                            whileHover={{ scale: 1.03, borderColor: "#FF5A00", color: "#FF5A00" }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-10 py-4 rounded-full font-bold text-stone-700 text-sm uppercase tracking-widest border border-stone-300 bg-white/70 backdrop-blur-sm hover:shadow-md transition-all duration-300"
                        >
                            Sign In
                        </motion.button>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.82 }}
                        className="flex flex-wrap items-center justify-center gap-8"
                    >
                        {[
                            { icon: <Star size={13} fill="currentColor" />, label: "4.9 / 5 Rating", color: "text-amber-500" },
                            { icon: <Clock size={13} />, label: "15 min delivery", color: "text-orange-500" },
                            { icon: <MapPin size={13} />, label: "12+ Locations", color: "text-rose-500" },
                        ].map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className={b.color}>{b.icon}</span>
                                <span className="text-stone-400 text-xs font-semibold tracking-wide">{b.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll cue */}
                <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
                    <span className="text-stone-400 text-[9px] font-bold uppercase tracking-[0.25em]">Discover</span>
                    <motion.div className="w-px h-10 bg-gradient-to-b from-orange-400/60 to-transparent"
                        animate={{ scaleY: [0, 1, 0], originY: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                </motion.div>

                {/* Decorative arch bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5) 70%, #ffffff 100%)" }} />
            </section>

            {/* ═══ STATS STRIP ═══ */}
            <section className="relative py-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #FF5A00 0%, #f97316 50%, #fb923c 100%)" }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: 50000, suffix: "+", label: "Happy Diners" },
                        { value: 120, suffix: "+", label: "Menu Items" },
                        { value: 12, suffix: "", label: "Locations" },
                        { value: 4.9, suffix: "★", label: "Avg Rating" },
                    ].map((s, i) => (
                        <FadeIn key={i} delay={i * 0.12}>
                            <motion.div
                                whileHover={{ scale: 1.1, y: -4 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="text-4xl md:text-5xl font-black text-white mb-1 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                                </div>
                                <div className="text-orange-100 text-xs font-bold uppercase tracking-widest">{s.label}</div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ═══ FEATURES BENTO ═══ */}
            <section className="py-28 px-6 bg-white">
                <FadeIn className="text-center mb-16 max-w-4xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 border border-orange-100 text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">
                        <Sparkles size={12} /> Why Velvet Plate
                    </span>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                        className="text-4xl md:text-6xl text-stone-900 tracking-tight leading-tight">
                        The difference is in{" "}
                        <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            the details
                        </span>
                    </h2>
                </FadeIn>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-5">

                    {/* Tile 1 — Lightning Fast (big) */}
                    <FadeIn delay={0} className="md:col-span-5 md:row-span-2" direction="left">
                        <motion.div whileHover={{ y: -10, scale: 1.015, boxShadow: "0 40px 100px rgba(255,90,0,0.28)" }}
                            transition={{ duration: 0.3 }}
                            className="relative h-full min-h-[320px] rounded-3xl overflow-hidden cursor-default"
                            style={{ background: "linear-gradient(150deg, #FF5A00, #f97316 55%, #fbbf24)" }}>
                            <motion.div className="absolute -top-14 -right-14 w-56 h-56 rounded-full"
                                style={{ background: "rgba(255,255,255,0.10)" }}
                                animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                            <div className="relative z-10 p-9 flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/30">
                                        <Zap size={26} className="text-white" />
                                    </div>
                                    <h3 className="text-white font-black text-2xl tracking-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Lightning Fast</h3>
                                    <p className="text-white/80 text-sm leading-relaxed font-medium max-w-xs">
                                        Order to table in under 15 minutes. We respect your time as much as your taste.
                                    </p>
                                </div>
                                <div className="mt-8 flex items-end gap-2">
                                    <span className="text-white font-black text-5xl tracking-tighter leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>&lt;15</span>
                                    <span className="text-white/70 text-sm font-medium mb-1.5">min avg<br />delivery</span>
                                </div>
                            </div>
                        </motion.div>
                    </FadeIn>

                    {/* Tile 2 — Premium Quality */}
                    <FadeIn delay={0.1} className="md:col-span-7" direction="right">
                        <motion.div whileHover={{ y: -7, scale: 1.01, boxShadow: "0 28px 70px rgba(16,185,129,0.16)" }}
                            transition={{ duration: 0.3 }}
                            className="relative rounded-3xl overflow-hidden p-8 cursor-default border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white flex items-start gap-6">
                            <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <Shield size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-stone-900 font-black text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Premium Quality</h3>
                                <p className="text-stone-500 text-sm leading-relaxed mb-5">Every ingredient sourced fresh daily. Zero compromise on taste or nutrition.</p>
                                <div className="flex gap-2 flex-wrap">
                                    {["Farm Fresh", "No Preservatives", "Chef Curated"].map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </FadeIn>

                    {/* Tile 3 — Made with Love */}
                    <FadeIn delay={0.15} className="md:col-span-4" direction="up">
                        <motion.div whileHover={{ y: -8, scale: 1.015, boxShadow: "0 24px 60px rgba(236,72,153,0.18)" }}
                            transition={{ duration: 0.3 }}
                            className="relative rounded-3xl overflow-hidden p-8 cursor-default min-h-[190px] border border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50 to-white">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/25 mb-5">
                                <Heart size={22} className="text-white" fill="white" />
                            </div>
                            <h3 className="text-stone-900 font-black text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Made with Love</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">Chef-crafted recipes with soul. Every bite tells a story.</p>
                            {[{ top: "12%", right: "10%", size: 16 }, { top: "38%", right: "18%", size: 11 }, { bottom: "15%", right: "8%", size: 13 }].map((pos, i) => (
                                <motion.div key={i} className="absolute text-rose-300 pointer-events-none"
                                    style={{ top: pos.top, right: pos.right, bottom: pos.bottom }}
                                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.9, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}>
                                    <Heart size={pos.size} fill="currentColor" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </FadeIn>

                    {/* Tile 4 — Exclusive Flavors */}
                    <FadeIn delay={0.2} className="md:col-span-3" direction="up">
                        <motion.div whileHover={{ y: -8, scale: 1.015, boxShadow: "0 24px 60px rgba(139,92,246,0.20)" }}
                            transition={{ duration: 0.3 }}
                            className="relative rounded-3xl overflow-hidden p-8 cursor-default min-h-[190px] border border-violet-100 bg-gradient-to-br from-violet-50 to-white flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-5">
                                    <Sparkles size={22} className="text-white" />
                                </div>
                                <h3 className="text-stone-900 font-black text-xl mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Exclusive Flavors</h3>
                                <p className="text-stone-500 text-xs leading-relaxed">Signature dishes you won't find anywhere else.</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-violet-100">
                                <span className="text-violet-600 font-black text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>120+</span>
                                <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Unique dishes</div>
                            </div>
                        </motion.div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ MENU CATEGORIES ═══ */}
            <section className="py-24 px-6" style={{ background: "#faf9f7" }}>
                <FadeIn className="text-center mb-16 max-w-4xl mx-auto">
                    <span className="inline-block px-5 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 shadow-sm">Our Menu</span>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                        className="text-4xl md:text-6xl text-stone-900 tracking-tight leading-tight">
                        Every craving,{" "}
                        <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>covered</span>
                    </h2>
                </FadeIn>

                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
                    {CATEGORIES.map((cat, i) => (
                        <FadeIn key={i} delay={i * 0.08} direction={i % 2 === 0 ? "left" : "right"}>
                            <motion.div
                                whileHover={{ scale: 1.04, y: -8, boxShadow: "0 28px 60px rgba(0,0,0,0.20)" }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => navigate("/menu")}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm aspect-[4/3]"
                                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                            >
                                <img src={cat.img} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `linear-gradient(to top, ${cat.color}cc, transparent 60%)` }} />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="text-white font-black text-xl tracking-tight leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{cat.label}</div>
                                    <div className="text-white/70 text-xs font-medium mt-0.5">{cat.desc}</div>
                                </div>
                                <motion.div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <ArrowRight size={14} className="text-white" />
                                </motion.div>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </section>

            {/* ═══ EXPERIENCE SPLIT ═══ */}
            <section className="py-28 px-6 bg-white overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">

                    {/* Left — content */}
                    <FadeIn direction="left">
                        <span className="inline-block px-5 py-2 rounded-full bg-orange-50 border border-orange-100 text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">The Experience</span>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                            className="text-4xl md:text-5xl text-stone-900 tracking-tight leading-tight mb-6">
                            Dine-In or Takeaway —<br />
                            <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                You Choose
                            </span>
                        </h2>
                        <p className="text-stone-500 text-base leading-relaxed mb-8">
                            Whether you're savoring a meal at our restaurant or grabbing a quick takeaway, we guarantee the same premium quality in every single order.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                { img: "/food/restaurant.png", title: "Dine-In", desc: "Reserve your table and enjoy a full restaurant experience" },
                                { img: "/food/takeaway.png", title: "Takeaway", desc: "Order ahead and skip the wait — ready when you are" },
                            ].map((item, i) => (
                                <motion.div key={i}
                                    whileHover={{ x: 6, boxShadow: "0 12px 40px rgba(255,90,0,0.10)" }}
                                    onClick={() => navigate("/menu")}
                                    className="group flex items-center gap-5 p-5 rounded-2xl bg-white border border-stone-100 hover:border-orange-200 cursor-pointer transition-all duration-300 shadow-sm"
                                >
                                    <div className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden bg-stone-100">
                                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-stone-900 font-bold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>{item.title}</div>
                                        <div className="text-stone-400 text-xs mt-0.5">{item.desc}</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
                                        <ChevronRight size={14} className="text-orange-400 group-hover:text-white transition-colors" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-8 mb-8">
                            {[{ v: "50k+", l: "Happy Diners" }, { v: "4.9★", l: "Avg Rating" }, { v: "12", l: "Locations" }].map((s, i) => (
                                <div key={i}>
                                    <div className="text-stone-900 font-black text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>{s.v}</div>
                                    <div className="text-stone-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">{s.l}</div>
                                </div>
                            ))}
                        </div>

                        <motion.button onClick={() => navigate("/menu")}
                            whileHover={{ scale: 1.03, boxShadow: "0 12px 36px rgba(255,90,0,0.25)" }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-white text-sm uppercase tracking-widest shadow-lg shadow-orange-500/15"
                            style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}>
                            Start Ordering <ArrowRight size={16} />
                        </motion.button>
                    </FadeIn>

                    {/* Right — photo mosaic */}
                    <FadeIn delay={0.2} direction="right">
                        <div className="relative grid grid-cols-2 grid-rows-2 gap-4 h-[480px]">
                            <motion.div whileHover={{ scale: 1.02 }} className="row-span-2 rounded-3xl overflow-hidden shadow-xl relative group">
                                <img src="/food/restaurant.png" alt="Restaurant" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                                <div className="absolute bottom-5 left-5 right-5">
                                    <div className="text-white font-black text-lg leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Premium Dining</div>
                                    <div className="text-white/70 text-xs mt-0.5">Restaurant Experience</div>
                                </div>
                                <motion.div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                                    <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest">● Live Now</span>
                                </motion.div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl overflow-hidden shadow-md relative group">
                                <img src="/food/chef.png" alt="Chef" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="text-white font-black text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>Expert Chefs</div>
                                </div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.03 }} className="rounded-3xl overflow-hidden shadow-md relative group">
                                <img src="/food/takeaway.png" alt="Takeaway" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <div className="text-white font-black text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>Quick Takeaway</div>
                                </div>
                                <motion.div className="absolute top-3 right-3 px-2.5 py-1 rounded-full shadow-lg"
                                    style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}>
                                    <span className="text-white text-[10px] font-black tracking-widest">&lt;15 min</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-24 px-6" style={{ background: "#faf9f7" }}>
                <FadeIn className="text-center mb-16 max-w-4xl mx-auto">
                    <span className="inline-block px-5 py-2 rounded-full bg-white border border-stone-200 text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 shadow-sm">What Diners Say</span>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                        className="text-4xl md:text-6xl text-stone-900 tracking-tight">
                        Loved by{" "}
                        <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            thousands
                        </span>
                    </h2>
                </FadeIn>

                <div className="max-w-2xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTestimonial}
                            initial={{ opacity: 0, y: 28, scale: 0.95, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                            whileHover={{ y: -4, boxShadow: "0 28px 60px rgba(0,0,0,0.10)" }}
                            className="p-10 md:p-14 rounded-3xl bg-white border border-stone-100 text-center shadow-xl shadow-stone-100/80 cursor-default transition-shadow"
                        >
                            {/* Decorative quote mark */}
                            <div className="text-8xl leading-none mb-2 -mt-4"
                                style={{ fontFamily: "'Playfair Display', serif", color: "#FF5A00", opacity: 0.15, lineHeight: 1 }}>
                                "
                            </div>
                            <div className="flex items-center justify-center gap-1 mb-5">
                                {Array.from({ length: TESTIMONIALS[activeTestimonial].rating }).map((_, i) => (
                                    <Star key={i} size={15} className="text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-stone-700 text-lg md:text-xl leading-relaxed font-light mb-8 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                                "{TESTIMONIALS[activeTestimonial].text}"
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm bg-gradient-to-br ${TESTIMONIALS[activeTestimonial].color}`}>
                                    {TESTIMONIALS[activeTestimonial].avatar}
                                </div>
                                <div className="text-left">
                                    <div className="text-stone-900 font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{TESTIMONIALS[activeTestimonial].name}</div>
                                    <div className="text-stone-400 text-xs">{TESTIMONIALS[activeTestimonial].role}</div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-2.5 mt-7">
                        {TESTIMONIALS.map((_, i) => (
                            <button key={i} onClick={() => setActiveTestimonial(i)}
                                className={`transition-all duration-300 rounded-full ${i === activeTestimonial ? "w-8 h-2.5 bg-orange-500" : "w-2.5 h-2.5 bg-stone-300 hover:bg-stone-400"}`} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA SECTION ═══ */}
            <section className="relative overflow-hidden">
                <div className="relative h-[580px] flex items-center justify-center">
                    <img src="/food/cta-bg.png" alt="Premium food" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(15,10,5,0.50) 0%, rgba(15,10,5,0.68) 55%, rgba(15,10,5,0.85) 100%)" }} />
                    <motion.div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(255,90,0,0.16) 0%, transparent 65%)" }}
                        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 65%)" }}
                        animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />

                    <FadeIn className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {[
                                { icon: <Star size={11} fill="currentColor" />, text: "4.9 / 5 Rating", color: "bg-amber-500" },
                                { icon: <Clock size={11} />, text: "15 min avg delivery", color: "bg-emerald-500" },
                                { icon: <Heart size={11} fill="currentColor" />, text: "50,000+ Happy Diners", color: "bg-rose-500" },
                            ].map((pill, i) => (
                                <motion.div key={i}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold"
                                    animate={{ y: [0, -4, 0] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}>
                                    <span className={`w-5 h-5 rounded-full ${pill.color} flex items-center justify-center text-white`}>{pill.icon}</span>
                                    {pill.text}
                                </motion.div>
                            ))}
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-6"
                            style={{ fontFamily: "'Playfair Display', serif" }}>
                            Every Bite,{" "}
                            <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                Unforgettable.
                            </span>
                        </motion.h2>

                        <p className="text-white/65 text-lg font-light max-w-lg mx-auto mb-10" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Join thousands of food lovers who've made Velvet Plate their go-to destination.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <motion.button onClick={() => navigate("/menu")}
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(255,90,0,0.5)" }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-3 px-12 py-5 rounded-full font-bold text-white text-sm uppercase tracking-widest shadow-2xl"
                                style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}>
                                <Utensils size={16} /> Explore the Menu <ArrowRight size={16} />
                            </motion.button>
                            <motion.button onClick={() => navigate("/signup")}
                                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.18)" }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-white text-sm uppercase tracking-widest border border-white/30 bg-white/10 backdrop-blur-md hover:shadow-lg transition-all">
                                Create Free Account
                            </motion.button>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-14 px-6 border-t border-stone-100 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                        <img src="/Velvet_Plate_v2.png" alt="Velvet Plate" className="w-9 h-9 object-contain"
                            style={{ filter: "drop-shadow(0 2px 8px rgba(255,90,0,0.20))" }} />
                        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.15rem", color: "#1c1917" }}>
                            Velvet Plate
                        </span>
                    </div>
                    <div className="text-stone-400 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                        © 2026 Velvet Plate. All rights reserved. Crafted with{" "}
                        <span className="text-rose-400">♥</span> for food lovers.
                    </div>
                    <div className="flex items-center gap-6">
                        {["Privacy", "Terms", "Contact"].map(l => (
                            <button key={l} className="text-stone-400 hover:text-orange-600 text-xs font-semibold uppercase tracking-widest transition-colors duration-200">{l}</button>
                        ))}
                    </div>
                </div>
            </footer>

            {/* Global styles */}
            <style>{`
                @keyframes goldShimmer {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
            `}</style>
        </div>
    );
}
