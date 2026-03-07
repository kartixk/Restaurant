import { create } from 'zustand';

const useCartStore = create((set) => ({
    // Local form state for Menu quantities
    quantities: {},
    setQuantity: (productId, qty) => set((state) => ({ quantities: { ...state.quantities, [productId]: qty } })),
    clearQuantity: (productId) => set((state) => {
        const next = { ...state.quantities };
        delete next[productId];
        return { quantities: next };
    }),

    // QSR Core Feature: Dine-in vs Takeaway
    orderType: 'DINE_IN',
    setOrderType: (type) => set({ orderType: type }),

    // Payment Strategy
    paymentMethod: 'CASH', // Default
    setPaymentMethod: (method) => set({ paymentMethod: method }),

    // Global cart data from DB
    cart: { items: [], total: 0 },
    setCart: (cartData) => set({ cart: cartData }),
}));

export default useCartStore;
