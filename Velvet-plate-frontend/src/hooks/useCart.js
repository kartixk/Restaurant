import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";


export const cartKeys = {
    all: ["cart"],
    detail: () => ["cart", "detail"],
};

export function useCart() {
    const { isAuthenticated } = useAuthStore();
    return useQuery({
        queryKey: cartKeys.detail(),
        queryFn: async () => {
            const { data } = await api.get("/cart");
            return data;
        },
        enabled: !!isAuthenticated,
        retry: 1
    });
}

// Add Item
export function useAddToCart() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, quantity }) => {
            const { data } = await api.post("/cart/items", { productId, quantity });
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
        mutationFn: async ({ productId, quantity }) => {
            const { data } = await api.put(`/cart/items/${productId}`, { quantity });
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
        mutationFn: async (productId) => {
            const { data } = await api.delete(`/cart/items/${productId}`);
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

// Update Order Type
export function useUpdateOrderType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orderType) => {
            const { data } = await api.put("/cart/order-type", { orderType });
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
        mutationFn: async ({ productId, quantity }) => {
            const { data } = await api.post("/cart/buy-now", { productId, quantity });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sweets"] });
        },
    });
}
