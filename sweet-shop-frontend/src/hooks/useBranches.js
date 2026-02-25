import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const branchesKeys = {
    all: ["branches"],
    detail: (id) => ["branches", id],
    mine: ["branches", "mine"],
};

export function useBranches() {
    return useQuery({
        queryKey: branchesKeys.all,
        queryFn: async () => {
            const { data } = await api.get("/branches");
            return data;
        },
    });
}

export function useMyBranch() {
    return useQuery({
        queryKey: branchesKeys.mine,
        queryFn: async () => {
            const { data } = await api.get("/branches/my-branch");
            return data;
        },
    });
}

export function useAddBranch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newBranch) => {
            const { data } = await api.post("/branches", newBranch);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchesKeys.all });
        },
    });
}

export function useUpdateBranch() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: responseData } = await api.put(`/branches/${id}`, data);
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: branchesKeys.all });
        },
    });
}
