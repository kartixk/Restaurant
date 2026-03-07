import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLocationStore = create(
    persist(
        (set) => ({
            selectedBranchId: null,
            selectedBranchName: null,
            selectedCity: null,

            setLocation: (branchId, branchName, city) => set({
                selectedBranchId: branchId,
                selectedBranchName: branchName,
                selectedCity: city
            }),

            clearLocation: () => set({
                selectedBranchId: null,
                selectedBranchName: null,
                selectedCity: null
            }),
        }),
        {
            name: 'velvet-location-storage',
        }
    )
);

export default useLocationStore;
