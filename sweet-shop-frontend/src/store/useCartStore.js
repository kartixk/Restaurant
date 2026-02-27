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
    orderType: 'DINE_IN', // Default
    setOrderType: (type) => set({ orderType: type }),

    // Global cart data from DB
    cart: { items: [], total: 0 },
    setCart: (cartData) => set({ cart: cartData }),

    // UI state for Cart Drawer (Preserved from original implementation)
    isCartOpen: false,
    setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
}));

export default useCartStore;
