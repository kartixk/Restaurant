// src/components/features/cart/CartStyles.js
export const cartStyles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif",
        color: '#0F172A'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '1.5rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
        letterSpacing: '-0.03em'
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#64748B',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'color 0.2s'
    },
    contentWrapper: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 400px',
        gap: '3rem',
        alignItems: 'start'
    },
    itemsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },

    // Cart Item Card
    cartItem: {
        display: 'flex',
        gap: '1.5rem',
        background: '#FFFFFF',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        alignItems: 'center',
        position: 'relative',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
    },
    itemImage: {
        width: '100px',
        height: '100px',
        borderRadius: '12px',
        objectFit: 'cover',
        backgroundColor: '#F1F5F9'
    },
    itemInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    itemName: {
        fontSize: '1.25rem',
        fontWeight: '800',
        color: '#0F172A',
        margin: 0,
        letterSpacing: '-0.01em'
    },
    itemPrice: {
        fontSize: '1.1rem',
        fontWeight: '800',
        color: '#FF5A00'
    },
    removeBtn: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: '#FEF2F2',
        color: '#EF4444',
        border: '1px solid #FEE2E2',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },

    // Summary Sidebar (The Receipt Terminal)
    summaryCard: {
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid #E2E8F0',
        position: 'sticky',
        top: '100px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)'
    },
    summaryTitle: {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: '1.5rem',
        letterSpacing: '-0.02em'
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        color: '#64748B',
        fontSize: '1rem',
        fontWeight: '500'
    },
    summaryTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '2px dashed #E2E8F0',
        color: '#0F172A',
        fontSize: '1.5rem',
        fontWeight: '800'
    },
    orderTypeBadge: {
        display: 'inline-block',
        background: '#FFF7F5',
        color: '#FF5A00',
        border: '1px solid #FFD8CC',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '800',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    checkoutBtn: {
        width: '100%',
        padding: '16px',
        background: '#FF5A00',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.1rem',
        fontWeight: '800',
        cursor: 'pointer',
        marginTop: '2rem',
        transition: 'transform 0.1s',
        boxShadow: '0 4px 12px rgba(255, 90, 0, 0.25)'
    },

    // Empty State
    emptyCart: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 0',
        textAlign: 'center'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1.5rem',
        opacity: 0.8
    },
    emptyTitle: {
        fontSize: '2rem',
        color: '#0F172A',
        marginBottom: '1rem',
        fontWeight: '800',
        letterSpacing: '-0.02em'
    },
    shopButton: {
        padding: '12px 32px',
        background: '#FF5A00',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '1.5rem',
        boxShadow: '0 4px 10px rgba(255, 90, 0, 0.2)'
    }
};
