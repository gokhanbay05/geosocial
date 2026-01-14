import { create } from "zustand";
import { useUIStore } from "./useUIStore";

export const useProfileStore = create((set) => ({
    viewingProfile: null,
    viewedProfileData: null,

    openProfile: (username) =>
        set((state) => {
            const uiStore = useUIStore.getState();

            if (state.viewingProfile === username) {
                uiStore.setLeftPanelTab("search");
                return state;
            }

            uiStore.setLeftPanelTab("search");
            return {
                viewingProfile: username,
                viewedProfileData: null,
            };
        }),

    setViewedProfileData: (data) => set({ viewedProfileData: data }),

    updateViewedProfileStats: (change) =>
        set((state) => {
            if (!state.viewedProfileData) return state;

            const currentStats = state.viewedProfileData.stats || {};

            return {
                viewedProfileData: {
                    ...state.viewedProfileData,
                    stats: {
                        ...currentStats,
                        totalLikesReceived: (currentStats.totalLikesReceived || 0) + change,
                    },
                },
            };
        }),

    resetProfileView: () =>
        set({ viewingProfile: null, viewedProfileData: null }),
}));