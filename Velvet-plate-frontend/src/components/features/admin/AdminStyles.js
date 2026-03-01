// src/components/features/admin/AdminStyles.js
export const adminStyles = {
    // --- LAYOUT & BACKGROUND ---
    container: {
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC', // Premium soft slate background
        fontFamily: "'Inter', sans-serif",
        color: '#0F172A' // Slate 900 for crisp readability
    },

    // --- HEADER ---
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
        letterSpacing: '-0.03em',
        fontFamily: "'Clash Display', 'Inter', sans-serif",
    },
    subtitle: {
        color: '#64748B', // Slate 500
        fontSize: '1rem',
        marginTop: '8px'
    },

    // --- PREMIUM CARDS (Clean White Surfaces) ---
    glassCard: {
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.02)',
        marginBottom: '2rem',
    },
    glassCardSmall: {
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '650px',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #F1F5F9',
        paddingBottom: '1rem'
    },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0F172A', margin: 0, letterSpacing: '-0.01em' },
    sectionSubtitle: { fontSize: '0.95rem', fontWeight: '500', color: '#64748B', margin: 0 },

    // --- STATS (Flame Orange & Clean Accents) ---
    statsContainer: { display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
    statBoxRevenue: {
        flex: 1,
        minWidth: '280px',
        background: 'linear-gradient(135deg, #FF5A00 0%, #E04E00 100%)', // Flame Orange pops on light bg
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 20px -5px rgba(255, 90, 0, 0.3)'
    },
    statBoxOrders: {
        flex: 1,
        minWidth: '280px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: '1.5rem 2rem',
        borderRadius: '16px',
        color: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    },
    statIcon: { fontSize: '2.5rem', padding: '10px' },
    statLabelWhite: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' },
    statValueWhite: { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFFFFF' },
    statLabelDark: { fontSize: '0.85rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' },
    statValueDark: { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0F172A' },

    // --- BUTTONS & FILTERS ---
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    filterButtons: { display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' },
    filterButton: {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        background: 'transparent',
        color: '#64748B',
        fontWeight: '600',
        fontSize: '0.875rem',
        transition: 'all 0.2s ease'
    },
    filterButtonActive: { background: '#FFFFFF', color: '#0F172A', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    downloadButton: {
        padding: '10px 20px',
        background: '#FFFFFF',
        color: '#0F172A',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },

    // --- TABLE (Sleek, light rows) ---
    tableCardContent: {
        background: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
    },
    tableHeaderOnly: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    tableScrollArea: { maxHeight: '400px', overflowY: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    tableHead: { background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
    tableHeader: { padding: '12px 16px', textAlign: 'left', color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' },
    tableRow: { borderBottom: '1px solid #F1F5F9', cursor: 'pointer', transition: 'background-color 0.2s' },
    tableCell: { padding: '16px', color: '#475569', fontSize: '0.875rem' },
    tableCellBold: { padding: '16px', fontWeight: '600', color: '#0F172A', fontSize: '0.875rem' },
    qtyBadge: { background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', color: '#475569' },

    // --- INVENTORY LIST ---
    inventoryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '8px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    itemName: { fontWeight: '700', color: '#0F172A', fontSize: '1rem', marginBottom: '4px' },
    catBadge: { fontSize: '0.7rem', background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' },
    inStock: { fontSize: '0.8rem', color: '#10B981', fontWeight: '600', marginTop: '6px' },
    outOfStock: { fontSize: '0.8rem', color: '#EF4444', fontWeight: '600', marginTop: '6px' },

    // CONTROLS
    inventoryControls: { display: 'flex', alignItems: 'center', gap: '12px' },
    stepper: { display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: '8px', padding: '4px', border: '1px solid #E2E8F0' },
    stepBtn: { width: '28px', height: '28px', border: 'none', background: '#FFFFFF', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    stepInput: { width: '40px', textAlign: 'center', border: 'none', background: 'transparent', color: '#0F172A', fontWeight: '700', fontSize: '0.9rem', outline: 'none' },

    actionBtnBlue: { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    actionBtnRed: { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
};
