import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const cartKeys = {
    all: ["cart"],
    detail: () => ["cart", "detail"],
};

export function useCart() {
    return useQuery({
        queryKey: cartKeys.detail(),
        queryFn: async () => {
            const { data } = await api.get("/cart");
            return data;
        },
        // We can retry fetching cart on failure sometimes, but we'll let components handle 401
        retry: 1
    });
}

// Add Item
export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sweetId, quantity }) => {
            const { data } = await api.post("/cart/items", { sweetId, quantity });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Update Quantity
export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sweetId, quantity }) => {
            const { data } = await api.put(`/cart/items/${sweetId}`, { quantity });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Remove Item
export function useRemoveCartItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sweetId) => {
            const { data } = await api.delete(`/cart/items/${sweetId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Confirm Order
export function useConfirmOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post("/cart/confirm");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

// Fast Buy
export function useFastBuy() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sweetId, quantity }) => {
            const { data } = await api.post("/cart/buy-now", { sweetId, quantity });
            return data;
        },
        onSuccess: () => {
            // Invalidate both sweets and cart conceptually if needed,
            // but Fast Buy affects sweets stock immediately
            queryClient.invalidateQueries({ queryKey: ["sweets"] });
        },
    });
}
