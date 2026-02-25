export const adminStyles = {
    // --- LAYOUT & BACKGROUND ---
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden'
    },
    blob1: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(142, 197, 252, 0.4)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0
    },
    blob2: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'rgba(224, 195, 252, 0.4)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        zIndex: 0
    },

    // --- HEADER ---
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        position: 'relative',
        zIndex: 1
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#2d3748',
        margin: 0,
        letterSpacing: '-0.5px',
        textShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    subtitle: {
        color: '#4a5568',
        fontSize: '1rem',
        marginTop: '5px'
    },
    backButton: {
        padding: '12px 24px',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: '12px',
        cursor: 'pointer',
        color: '#4a5568',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },

    // --- GLASS CARDS ---
    glassCard: {
        background: 'rgba(255, 255, 255, 0.65)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 1
    },
    glassCardSmall: {
        background: 'rgba(255, 255, 255, 0.65)',
        borderRadius: '24px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '650px',
        position: 'relative',
        zIndex: 1
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    },
    sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#1a202c', margin: 0 },
    sectionSubtitle: { fontSize: '1.2rem', fontWeight: '700', color: '#2d3748', margin: 0 },
    dateBadge: {
        background: 'rgba(0,0,0,0.05)',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#4a5568'
    },

    // --- STATS ---
    statsContainer: { display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' },
    statBoxRevenue: {
        flex: 1,
        minWidth: '280px',
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        padding: '2rem',
        borderRadius: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 10px 20px rgba(17, 153, 142, 0.3)'
    },
    statBoxOrders: {
        flex: 1,
        minWidth: '280px',
        background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
        padding: '2rem',
        borderRadius: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 10px 20px rgba(58, 123, 213, 0.3)'
    },
    statIcon: { fontSize: '3rem', background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px' },
    statLabelWhite: { fontSize: '0.9rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' },
    statValueWhite: { fontSize: '2.5rem', fontWeight: '800' },

    // --- FILTERS ---
    filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    filterButtons: { display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '5px', borderRadius: '50px' },
    filterButton: {
        padding: '8px 20px',
        border: 'none',
        borderRadius: '40px',
        cursor: 'pointer',
        background: 'transparent',
        color: '#64748b',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.3s ease'
    },
    filterButtonActive: { background: '#fff', color: '#3a7bd5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    downloadButton: {
        padding: '10px 24px',
        background: 'linear-gradient(45deg, #10b981, #059669)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },

    // --- TABLE ---
    tableCardContent: {
        background: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
    },
    tableHeaderOnly: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    tableScrollArea: {
        maxHeight: '400px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#cbd5e1 transparent'
    },
    table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
    tableHead: { background: '#f8fafc' },
    tableHeader: {
        padding: '16px',
        textAlign: 'left',
        color: '#64748b',
        fontSize: '0.8rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tableRow: { borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
    tableCell: { padding: '16px', color: '#334155', fontSize: '0.95rem' },
    tableCellDim: { padding: '16px', color: '#94a3b8', fontSize: '0.9rem' },
    tableCellBold: { padding: '16px', fontWeight: '600', color: '#1e293b' },
    tableCellGreen: { padding: '16px', fontWeight: '700', color: '#10b981' },
    qtyBadge: { background: '#edf2f7', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
    emptyCell: { padding: '40px', textAlign: 'center', color: '#94a3b8' },

    // --- SPLIT GRID ---
    gridSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },

    // --- BRANCH GRID ---
    branchGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' },
    branchCard: {
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '2rem',
        borderRadius: '20px',
        cursor: 'pointer',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        border: '1px solid rgba(255,255,255,0.6)'
    },
    branchCardHeader: { fontSize: '1.4rem', color: '#0369a1', fontWeight: 'bold', margin: 0 },
    branchLocation: { color: '#64748b', fontSize: '0.95rem', margin: 0 },
    branchActionButton: {
        alignSelf: 'flex-start',
        background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        marginTop: '10px'
    },

    // --- FORM ---
    form: { display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' },
    input: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', outline: 'none', transition: 'border 0.2s' },
    select: { padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: '#f8fafc', outline: 'none' },
    addButton: {
        gridColumn: 'span 2',
        padding: '14px',
        background: 'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '700',
        fontSize: '1rem',
        marginTop: '10px',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
    },

    // --- INVENTORY ---
    inventoryHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        paddingBottom: '1rem'
    },
    searchWrapper: { position: 'relative' },
    searchInput: {
        padding: '8px 32px 8px 12px',
        borderRadius: '20px',
        border: '1px solid #cbd5e1',
        width: '160px',
        fontSize: '0.9rem',
        background: 'rgba(255,255,255,0.8)'
    },
    searchIcon: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', opacity: 0.5 },

    // CATEGORY TABS
    categoryTabsContainer: {
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        marginBottom: '0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
    },
    categoryTab: {
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        color: '#64748b',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
    },
    categoryTabActive: {
        background: '#3a7bd5',
        color: '#fff',
        borderColor: '#3a7bd5',
        boxShadow: '0 2px 5px rgba(58, 123, 213, 0.3)'
    },

    inventoryListScroll: { overflowY: 'auto', flex: 1, padding: '4px', scrollbarWidth: 'thin' },
    inventoryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        marginBottom: '10px',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.9)',
        transition: 'all 0.2s'
    },
    inventoryInfo: { flex: 1 },
    itemName: { fontWeight: '700', color: '#2d3748', fontSize: '1.05rem', marginBottom: '4px' },
    catBadge: { fontSize: '0.75rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#64748b', fontWeight: '600' },
    inStock: { fontSize: '0.85rem', color: '#10b981', fontWeight: '600', marginTop: '4px' },
    outOfStock: { fontSize: '0.85rem', color: '#ef4444', fontWeight: '600', marginTop: '4px' },

    inventoryControls: { display: 'flex', alignItems: 'center', gap: '12px' },
    stepper: { display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px' },
    stepBtn: { width: '28px', height: '28px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    stepInput: { width: '30px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: '600', fontSize: '0.9rem' },

    actionBtnBlue: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#ebf8ff', color: '#3182ce', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    actionBtnRed: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },

    loadingContainer: { padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#64748b' },
    spinner: { width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTop: '3px solid #3182ce', borderRadius: '50%', animation: 'spin 1s linear infinite' },
    emptyInventory: { textAlign: 'center', padding: '40px', color: '#a0aec0' }
};
