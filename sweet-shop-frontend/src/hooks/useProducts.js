import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";


export const productsKeys = {
    all: ["products"],
    byBranch: (branchId) => ["products", { branchId }],
    detail: (id) => ["products", id],
};

export function useProducts(branchId = null) {
    const { isAuthenticated } = useAuthStore();
    return useQuery({
        queryKey: branchId ? productsKeys.byBranch(branchId) : productsKeys.all,
        queryFn: async () => {
            const params = branchId ? { branchId } : {};
            const { data } = await api.get("/products", { params });
            return data;
        },
        enabled: !!isAuthenticated,
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
