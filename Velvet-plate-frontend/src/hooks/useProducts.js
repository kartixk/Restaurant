import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const productsKeys = {
    all: ["products"],
    byBranch: (branchId) => ["products", { branchId }],
    detail: (id) => ["products", id],
};

export function useProducts(branchId = null) {
    return useQuery({
        queryKey: branchId ? productsKeys.byBranch(branchId) : productsKeys.all,
        queryFn: async () => {
            const params = branchId ? { branchId } : {};
            const { data } = await api.get("/products", { params });
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes - keep menu data fresh but avoid constant refetching
        cacheTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useAddProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newProduct) => {
            const { data } = await api.post("/products", newProduct);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/products/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
        },
    });
}

export function useUpdateProductStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, quantity }) => {
            const { data } = await api.put(`/products/${id}`, { quantity });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
        },
    });
}

export function useUpdateProductAvailability() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, isAvailable }) => {
            const { data } = await api.patch(`/products/${id}/availability`, { isAvailable });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productsKeys.all });
        },
    });
}
