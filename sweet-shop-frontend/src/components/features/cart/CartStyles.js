export const cartStyles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: '#f5f7fa',
        minHeight: '100vh'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#2d3748',
        margin: 0
    },
    backButton: {
        padding: '0.75rem 1.5rem',
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        color: '#555',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
    },
    loader: {
        width: '50px',
        height: '50px',
        border: '5px solid #e9ecef',
        borderTop: '5px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    },
    loadingText: {
        marginTop: '1rem',
        color: '#666'
    },
    emptyCart: {
        background: 'white',
        borderRadius: '12px',
        padding: '4rem 2rem',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    },
    emptyIcon: { fontSize: '5rem', marginBottom: '1rem' },
    emptyTitle: { fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' },
    emptyText: { color: '#666', marginBottom: '2rem' },
    shopButton: {
        padding: '1rem 2.5rem',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        cursor: 'pointer'
    },
    contentWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2rem',
        alignItems: 'start'
    },
    itemsSection: {
        flex: '2',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    summaryWrapper: {
        flex: '1',
        minWidth: '300px',
        position: 'sticky',
        top: '20px'
    },
    cartItem: {
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.5rem 0' },
    itemDetails: { marginBottom: '1rem' },
    detailRow: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: '#555', marginBottom: '4px' },
    detailLabel: { minWidth: '70px' },
    detailValue: { fontWeight: '600', color: '#333' },

    qtyContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
    qtyBtn: {
        width: '28px', height: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#edf2f7', border: '1px solid #cbd5e0',
        borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
    },
    qtyValue: { fontWeight: 'bold', minWidth: '20px', textAlign: 'center' },

    stockWarning: {
        background: '#fff3cd', color: '#856404', padding: '5px 10px',
        borderRadius: '5px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px',
        display: 'inline-block'
    },
    itemTotal: { borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '5px', fontWeight: '600' },
    itemTotalAmount: { color: '#667eea', fontSize: '1.1rem', marginLeft: '5px' },
    removeButton: {
        padding: '8px 16px',
        background: '#ff4d4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600'
    },
    summaryCard: {
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
    },
    summaryTitle: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', margin: 0 },
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
    summaryDivider: { height: '1px', background: '#eee', margin: '1.5rem 0' },
    summaryTotal: { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' },
    totalValue: { color: '#667eea', fontSize: '1.5rem' },
    confirmButton: {
        width: '100%',
        padding: '1rem',
        background: 'linear-gradient(to right, #667eea, #764ba2)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'transform 0.2s'
    }
};
