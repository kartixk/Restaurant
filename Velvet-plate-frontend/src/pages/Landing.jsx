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

// ─── Warm Marquee ─────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    { icon: <Star size={11} fill="currentColor" />, text: "50,000+ Happy Diners" },
    { icon: <Flame size={11} />, text: "Premium Quality" },
    { icon: <Utensils size={11} />, text: "120+ Menu Items" },
    { icon: <Clock size={11} />, text: "15 Min Delivery" },
    { icon: <MapPin size={11} />, text: "12 Locations" },
    { icon: <Sparkles size={11} />, text: "Chef Crafted" },
    { icon: <Heart size={11} fill="currentColor" />, text: "Made With Love" },
    { icon: <Shield size={11} />, text: "Farm Fresh Daily" },
];
function Marquee() {
    const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return (
        <div className="relative overflow-hidden py-3.5" style={{
            background: "linear-gradient(135deg, #FF5A00 0%, #f97316 50%, #fb923c 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.08)"
        }}>
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            {/* Pure CSS animation — runs on compositor thread, never jank */}
            <div className="relative z-10" style={{ overflow: "hidden" }}>
                <div
                    className="flex gap-8 whitespace-nowrap"
                    style={{ animation: "marqueeScroll 28s linear infinite", willChange: "transform", transform: "translateZ(0)" }}
                >
                    {items.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] shrink-0 text-white/90">
                            <span className="text-white/70">{item.icon}</span>
                            {item.text}
                            <span className="ml-5 text-white/30">✦</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Animated counter — re-triggers every scroll ─────────────────────────────
function AnimatedCounter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    useEffect(() => {
        if (!isInView) return;
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

// ─── FadeIn wrapper — smooth one-shot viewport animation ─────────────────────
function FadeIn({ children, delay = 0, className = "", direction = "up" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px", amount: 0.12 });
    const initial = {
        up: { opacity: 0, y: 28 },
        down: { opacity: 0, y: -28 },
        left: { opacity: 0, x: -28 },
        right: { opacity: 0, x: 28 },
    }[direction];
    const visible = direction === "up" || direction === "down"
        ? { opacity: 1, y: 0 }
        : { opacity: 1, x: 0 };
    return (
        <motion.div
            ref={ref}
            className={className}
            style={{ willChange: "opacity, transform" }}
            initial={initial}
            animate={isInView ? visible : initial}
            transition={{
                duration: 0.55,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
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
        let rafId = null;
        let lastScrolled = false;
        const unsubscribe = scrollY.on("change", v => {
            if (rafId) return; // skip if a frame is already queued
            rafId = requestAnimationFrame(() => {
                const isScrolled = v > 40;
                if (isScrolled !== lastScrolled) {
                    lastScrolled = isScrolled;
                    setNavScrolled(isScrolled);
                }
                rafId = null;
            });
        });
        return () => { unsubscribe(); if (rafId) cancelAnimationFrame(rafId); };
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
            <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ contain: "layout paint" }}>

                {/* ── Rich layered background ── */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#fffaf4 0%,#fff7ec 40%,#fef0da 70%,#fffbf5 100%)" }} />
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse at 5% 50%,rgba(255,90,0,0.13) 0%,transparent 55%), radial-gradient(ellipse at 95% 10%,rgba(212,168,83,0.16) 0%,transparent 50%), radial-gradient(ellipse at 60% 100%,rgba(249,115,22,0.09) 0%,transparent 45%)` }} />
                <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle,#c8996a 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                {particles.map((p, i) => <Particle key={i} style={p} />)}

                {/* ── Glow orbs ── */}
                <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(255,90,0,0.10) 0%,transparent 65%)" }} />
                <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(212,168,83,0.13) 0%,transparent 65%)" }} />

                {/* ═══════════ SPLIT LAYOUT ═══════════ */}
                <motion.div
                    style={{ y: heroY, willChange: "transform" }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16 pt-28 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center"
                >
                    {/* ══ LEFT COLUMN ══ */}
                    <div className="flex flex-col items-start">



                        {/* ── Brand Identity Block ── */}
                        <motion.div
                            className="flex flex-col items-start mb-6"
                            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.12 }}
                        >
                            {/* Logo orb + tagline row */}
                            <div className="flex items-center gap-3 mb-3">
                                <motion.div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: "linear-gradient(135deg,#FF5A00,#f97316)",
                                        boxShadow: "0 8px 32px rgba(255,90,0,0.45)",
                                    }}
                                    animate={{ opacity: [1, 0.82, 1] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <motion.img
                                        src="/Velvet_Plate_v2.png" alt="Velvet Plate"
                                        className="w-8 h-8 object-contain"
                                        animate={{ y: [0, -3, 0] }}
                                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                </motion.div>
                                <div className="flex items-center gap-2">
                                    <div className="h-px w-6" style={{ background: "linear-gradient(to right,#D4A853,transparent)" }} />
                                    <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.22em", color: "#c2873a", textTransform: "uppercase" }}>
                                        ✦ Fine Dining · Est. 2024 ✦
                                    </span>
                                    <div className="h-px w-6" style={{ background: "linear-gradient(to left,#D4A853,transparent)" }} />
                                </div>
                            </div>

                            {/* The name — BIG and golden */}
                            <motion.h1
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                                    fontWeight: 900,
                                    letterSpacing: "-0.02em",
                                    lineHeight: 1,
                                    color: "#FF5A00",
                                }}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.85, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Velvet Plate
                            </motion.h1>

                            {/* Decorative gold underline */}
                            <motion.div
                                className="mt-2 h-0.5 rounded-full"
                                style={{ background: "linear-gradient(to right,#FF5A00,#D4A853,transparent)" }}
                                initial={{ width: 0 }} animate={{ width: "75%" }}
                                transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </motion.div>

                        {/* Large italic hero headline */}
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "clamp(2.8rem,5.5vw,4.8rem)",
                                fontWeight: 400,
                                fontStyle: "italic",
                                color: "#1c1917",
                                letterSpacing: "-0.025em",
                                lineHeight: 1.1,
                                marginBottom: "0.2em",
                            }}
                        >
                            Where Every<br />Bite
                        </motion.h2>

                        {/* Rolling word — NOT inside overflow:hidden, no clipping */}
                        <motion.div
                            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.38 }}
                            style={{ minHeight: "5.5rem", display: "flex", alignItems: "center", marginBottom: "1.5rem" }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeWord}
                                    initial={{ y: 70, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: "clamp(2.8rem,5.5vw,4.8rem)",
                                        fontWeight: 900,
                                        letterSpacing: "-0.03em",
                                        lineHeight: 1.2,
                                        paddingTop: "0.05em",
                                        paddingBottom: "0.15em",
                                        background: ROLLING_WORDS[activeWord].gradient,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        whiteSpace: "nowrap",
                                        display: "block",
                                    }}
                                >
                                    {ROLLING_WORDS[activeWord].text}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        {/* Sub-headline */}
                        <motion.p
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.50 }}
                            className="text-stone-500 text-base md:text-lg leading-relaxed max-w-md mb-9"
                            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
                        >
                            Chef-crafted dishes, sourced fresh daily. Dine in or get it delivered in under 15 minutes — without compromising on taste.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.62 }}
                            className="flex flex-wrap items-center gap-4 mb-10"
                        >
                            <motion.button
                                onClick={() => navigate("/menu")}
                                whileHover={{ scale: 1.04, boxShadow: "0 20px 56px rgba(255,90,0,0.38)" }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-3 px-9 py-4 rounded-2xl font-bold text-white text-sm uppercase tracking-widest"
                                style={{ background: "linear-gradient(135deg,#FF5A00,#f97316)", boxShadow: "0 8px 32px rgba(255,90,0,0.30), inset 0 1px 0 rgba(255,255,255,0.20)" }}
                            >
                                <Utensils size={16} />
                                Explore Menu
                                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                                    <ArrowRight size={15} />
                                </motion.span>
                            </motion.button>

                            <motion.button
                                onClick={() => navigate("/login")}
                                whileHover={{ scale: 1.03, borderColor: "#FF5A00", color: "#FF5A00" }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-2 px-9 py-4 rounded-2xl font-bold text-stone-700 text-sm uppercase tracking-widest border border-stone-200 bg-white/70 backdrop-blur-sm transition-all duration-300"
                            >
                                Sign In
                            </motion.button>
                        </motion.div>

                        {/* Stats row */}
                        <motion.div
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.74 }}
                            className="flex items-center gap-6 mb-8 flex-wrap"
                        >
                            {[
                                { value: "4.9★", label: "Rating", color: "#f59e0b" },
                                { value: "50k+", label: "Diners", color: "#FF5A00" },
                                { value: "12+", label: "Locations", color: "#10b981" },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="font-black text-xl leading-none mb-0.5" style={{ fontFamily: "'Playfair Display',serif", color: s.color }}>{s.value}</div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
                                </div>
                            ))}
                            <div className="w-px h-10 bg-stone-200 hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2.5">
                                    {["#f97316", "#8b5cf6", "#ec4899", "#10b981", "#3b82f6"].map((c, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: c }} />
                                    ))}
                                </div>
                                <div className="text-stone-400 text-[11px] font-semibold leading-tight">
                                    Loved by<br /><strong className="text-stone-700">50,000+</strong>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature chips */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.88 }}
                            className="flex flex-wrap gap-2"
                        >
                            {[
                                { icon: <Zap size={11} />, label: "< 15 min delivery", c: "text-amber-700 bg-amber-50 border-amber-200" },
                                { icon: <Shield size={11} />, label: "Farm Fresh · No Preservatives", c: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                                { icon: <Sparkles size={11} />, label: "120+ Unique Dishes", c: "text-violet-700 bg-violet-50 border-violet-200" },
                            ].map((f, i) => (
                                <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-semibold ${f.c}`}>
                                    {f.icon}{f.label}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                    {/* ══ RIGHT COLUMN — 3 food cards, each with 1 floating chip ══ */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="relative hidden lg:block h-[600px] -mt-16"
                    >
                        {/* ── Card 1: Pasta (main, large) + Rating chip ── */}
                        <div className="absolute left-0 top-0 w-[280px] h-[330px]" style={{ zIndex: 2 }}>
                            {/* Image card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.35 }}
                                className="w-full h-full rounded-3xl overflow-hidden"
                                style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.20), 0 6px 20px rgba(255,90,0,0.14)" }}
                            >
                                <img src="/food/pasta.png" alt="Truffle Pasta" className="w-full h-full object-cover" />
                                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(12,5,0,0.82) 0%,rgba(0,0,0,0.05) 55%,transparent 100%)" }} />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-2 inline-block" style={{ background: "linear-gradient(135deg,#FF5A00,#f97316)" }}>★ Chef's Pick</span>
                                    <div className="text-white font-black text-xl leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>Truffle Pasta</div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-white/60 text-xs">Al dente · Truffle cream</span>
                                        <span className="text-orange-300 font-black text-sm">₹549</span>
                                    </div>
                                </div>
                            </motion.div>
                            {/* Rating chip — attached below-left of pasta card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                                className="absolute -bottom-14 left-4 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-white/80 shadow-xl backdrop-blur-xl"
                                style={{ background: "rgba(255,255,255,0.95)" }}
                            >
                                <div className="text-stone-900 font-black text-2xl leading-none" style={{ fontFamily: "'Playfair Display',serif" }}>4.9</div>
                                <div>
                                    <div className="flex gap-0.5 mb-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="text-amber-400 fill-amber-400" />)}</div>
                                    <div className="text-stone-400 text-[9px] font-bold uppercase tracking-widest">50k+ Reviews</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Card 2: Burger (top right) + Delivery chip ── */}
                        <div className="absolute right-0 -top-4 w-[210px] h-[230px]" style={{ zIndex: 2 }}>
                            {/* Image card */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-full h-full rounded-3xl overflow-hidden"
                                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
                            >
                                <img src="/food/burger.png" alt="Smash Burger" className="w-full h-full object-cover" />
                                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.70) 0%,transparent 55%)" }} />
                                <div className="absolute bottom-3 left-4">
                                    <div className="text-white font-black text-base leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>Smash Burger</div>
                                    <div className="text-white/60 text-[10px]">Handcrafted patty</div>
                                </div>
                            </motion.div>
                            {/* Delivery chip — attached at top-left of burger card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                                className="absolute -top-3 -left-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/80 shadow-xl backdrop-blur-xl"
                                style={{ background: "rgba(255,255,255,0.95)" }}
                            >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#FF5A00,#f97316)" }}>
                                    <Zap size={11} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-stone-900 font-black text-xs leading-none" style={{ fontFamily: "'Playfair Display',serif" }}>&lt;15 min</div>
                                    <div className="text-stone-400 text-[8px] font-bold uppercase tracking-widest">delivery</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Card 3: Dessert (bottom right) + Live order toast ── */}
                        <div className="absolute right-0 bottom-8 w-[230px] h-[200px]" style={{ zIndex: 2 }}>
                            {/* Image card */}
                            <motion.div
                                animate={{ y: [0, 5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="w-full h-full rounded-3xl overflow-hidden"
                                style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}
                            >
                                <img src="/food/dessert.png" alt="Dessert" className="w-full h-full object-cover" />
                                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.70) 0%,transparent 60%)" }} />
                                <div className="absolute bottom-3 left-4">
                                    <div className="text-white font-black text-base leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>Sweet Finish</div>
                                </div>
                            </motion.div>
                            {/* Live order toast — attached at top-left of dessert card */}
                            <motion.div
                                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3, duration: 0.6 }}
                                className="absolute -top-4 -left-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-white/80 shadow-xl backdrop-blur-xl"
                                style={{ background: "rgba(255,255,255,0.95)", zIndex: 5 }}
                            >
                                <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src="/food/pizza.png" alt="order" className="w-full h-full object-cover" />
                                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px #34d399" }} />
                                </div>
                                <div>
                                    <div className="text-stone-800 font-bold text-[11px]">Just ordered!</div>
                                    <div className="text-stone-400 text-[9px]">Pizza · 1 min ago</div>
                                </div>
                                <motion.div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
                                    transition={{ duration: 1.8, repeat: Infinity }} />
                            </motion.div>
                        </div>
                    </motion.div>

                </motion.div>
                {/* Mobile food preview */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.55 }}
                    className="lg:hidden relative z-10 mx-6 mb-10 rounded-3xl overflow-hidden h-56 shadow-2xl"
                >
                    <img src="/food/pasta.png" alt="Signature dish" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(15,8,0,0.72) 0%,transparent 60%)" }} />
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-orange-300">★ Chef's Pick</span>
                            <div className="text-white font-black text-xl" style={{ fontFamily: "'Playfair Display',serif" }}>Truffle Pasta</div>
                        </div>
                        <span className="text-orange-300 font-black text-lg">₹549</span>
                    </div>
                </motion.div>

                {/* Scroll cue */}
                <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    <span className="text-stone-400 text-[9px] font-bold uppercase tracking-[0.25em]">Scroll</span>
                    <motion.div className="w-px h-8 bg-gradient-to-b from-orange-400/70 to-transparent"
                        animate={{ scaleY: [0, 1, 0], originY: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                </motion.div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom,transparent,rgba(255,255,255,0.6) 70%,#fff 100%)" }} />
            </section>

            {/* ═══ MARQUEE TICKER ═══ */}
            <Marquee />

            {/* ═══ STATS STRIP ═══ */}
            <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff8ed 0%, #fef3e2 50%, #fff6ef 100%)" }}>
                {/* Top and bottom rule lines */}
                <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,90,0,0.25) 30%, rgba(212,168,83,0.35) 50%, rgba(255,90,0,0.25) 70%, transparent)" }} />
                <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,90,0,0.15) 30%, rgba(212,168,83,0.22) 50%, rgba(255,90,0,0.15) 70%, transparent)" }} />
                <div className="relative max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4">
                        {[
                            { value: 50000, suffix: "+", label: "Happy Diners", icon: <Heart size={16} /> },
                            { value: 120, suffix: "+", label: "Menu Items", icon: <Utensils size={16} /> },
                            { value: 12, suffix: "", label: "Locations", icon: <MapPin size={16} /> },
                            { value: 4.9, suffix: "★", label: "Avg Rating", icon: <Star size={16} fill="currentColor" /> },
                        ].map((s, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-center py-6 px-4 relative"
                                >
                                    {i < 3 && <div className="absolute right-0 top-1/4 bottom-1/4 w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.3), transparent)" }} />}
                                    <div className="inline-flex items-center justify-center w-9 h-9 rounded-full mb-3" style={{ background: "rgba(255,90,0,0.08)", color: "#FF5A00" }}>
                                        {s.icon}
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black tracking-tighter mb-1" style={{ fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES BENTO ═══ */}
            <section className="py-28 px-6 bg-white">
                <FadeIn className="text-center mb-16 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-orange-300" />
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">
                            <Sparkles size={11} /> Why Velvet Plate
                        </span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-orange-300" />
                    </div>
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
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">Our Menu</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
                    </div>
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
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-10 bg-gradient-to-r from-transparent to-orange-300" />
                            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">The Experience</span>
                            <div className="h-px w-10 bg-gradient-to-l from-transparent to-orange-300" />
                        </div>
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
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-stone-300" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">What Diners Say</span>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-stone-300" />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
                        className="text-4xl md:text-6xl text-stone-900 tracking-tight">
                        Loved by{" "}
                        <span className="italic" style={{ background: "linear-gradient(135deg, #FF5A00, #D4A853)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            thousands
                        </span>
                    </h2>
                </FadeIn>

                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <FadeIn key={i} delay={i * 0.12}>
                            <motion.div
                                whileHover={{ y: -8, boxShadow: i === 1 ? "0 32px 72px rgba(255,90,0,0.18)" : "0 28px 60px rgba(0,0,0,0.10)" }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="relative h-full rounded-3xl p-8 flex flex-col cursor-default"
                                style={{
                                    background: i === 1 ? "linear-gradient(145deg, #fff8f3, #ffffff)" : "#ffffff",
                                    border: i === 1 ? "1.5px solid rgba(255,90,0,0.22)" : "1.5px solid rgba(0,0,0,0.06)",
                                    boxShadow: i === 1 ? "0 16px 48px rgba(255,90,0,0.10), 0 2px 12px rgba(0,0,0,0.05)" : "0 8px 32px rgba(0,0,0,0.06)",
                                }}
                            >
                                {i === 1 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap"
                                        style={{ background: "linear-gradient(135deg, #FF5A00, #f97316)" }}>
                                        ★ Most Loved
                                    </div>
                                )}
                                <div className="text-[72px] leading-none mb-1 -ml-1 select-none"
                                    style={{ fontFamily: "'Playfair Display', serif", color: i === 1 ? "#FF5A00" : "#D4A853", opacity: 0.18, lineHeight: 0.8 }}>
                                    "
                                </div>
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, si) => (
                                        <Star key={si} size={13} className="text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-stone-600 text-base leading-relaxed font-light italic flex-1 mb-6"
                                    style={{ fontFamily: "'Playfair Display', serif" }}>
                                    "{t.text}"
                                </p>
                                <div className="h-px mb-5" style={{ background: i === 1 ? "linear-gradient(to right, rgba(255,90,0,0.15), transparent)" : "rgba(0,0,0,0.05)" }} />
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-xs bg-gradient-to-br ${t.color} flex-shrink-0`}
                                        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="text-stone-900 font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>{t.name}</div>
                                        <div className="text-stone-400 text-[11px] font-medium mt-0.5">{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        </FadeIn>
                    ))}
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
                    100% { background-position: 220% center; }
                }
                @keyframes marqueeScroll {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                ::selection { background: rgba(255,90,0,0.18); color: #7c3200; }
            `}</style>
        </div>
    );
}
