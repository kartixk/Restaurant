import { create } from 'zustand';

const useCartStore = create((set) => ({
    // Local form state for Sweets.jsx
    quantities: {},
    setQuantity: (sweetId, qty) => set((state) => ({ quantities: { ...state.quantities, [sweetId]: qty } })),
    clearQuantity: (sweetId) => set((state) => {
        const next = { ...state.quantities };
        delete next[sweetId];
        return { quantities: next };
    }),

    // Global cart data from DB for Cart.jsx components
    cart: { items: [], total: 0 },
    setCart: (cartData) => set({ cart: cartData }),
}));

export default useCartStore;
