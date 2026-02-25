import { create } from 'zustand';

import api from '../api/axios';

const initialRole = localStorage.getItem("userRole");
const initialAuth = localStorage.getItem("isAuthenticated") === "true";
const initialUser = (() => {
    try {
        const stored = localStorage.getItem("userData");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
})();

export const useAuthStore = create((set) => ({
    role: initialRole,
    isAuthenticated: initialAuth,
    user: initialUser,

    login: (userData) => {
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(userData));
        set({ role: userData.role, isAuthenticated: true, user: userData });
    },

    logout: async () => {
        try {
            await api.get('/auth/logout');
        } catch (err) {
            console.error("Logout failed:", err);
        }
        localStorage.removeItem("userRole");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        set({ role: null, isAuthenticated: false, user: null });
    }
}));

export default useAuthStore;
