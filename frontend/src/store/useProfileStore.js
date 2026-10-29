import { create } from "zustand";
import { useUIStore } from "./useUIStore";
import { usePostStore } from "./usePostStore";

export const useProfileStore = create((set) => ({
    viewingProfile: null,
    viewedProfileData: null,
    returnContext: null,

    openProfile: (username) =>
        set((state) => {
            const uiStore = useUIStore.getState();
            const postStore = usePostStore.getState();
            const isMobile =
                typeof window !== "undefined" &&
                window.matchMedia("(max-width: 1023px)").matches;

            const returnContext = state.viewingProfile
                ? state.returnContext
                : {
                      activePost: postStore.activePost,
                      wasRightPanelOpen: uiStore.isRightPanelOpen,
                      wasMobilePanelOpen: uiStore.isMobilePanelOpen,
                      previousTab: uiStore.leftPanelTab,
                  };

            if (isMobile && postStore.activePost) {
                postStore.closePostDetail();
            }

            uiStore.setLeftPanelTab("search");

            if (state.viewingProfile === username) {
                return { returnContext };
            }

            return {
                viewingProfile: username,
                viewedProfileData: null,
                returnContext,
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

    clearViewedProfile: () =>
        set({ viewingProfile: null, viewedProfileData: null, returnContext: null }),

    resetProfileView: () =>
        set((state) => {
            const ctx = state.returnContext;
            const uiStore = useUIStore.getState();
            const postStore = usePostStore.getState();
            const isMobile =
                typeof window !== "undefined" &&
                window.matchMedia("(max-width: 1023px)").matches;

            if (ctx) {
                if (ctx.activePost) {
                    if (isMobile) {
                        if (ctx.wasRightPanelOpen) {
                            uiStore.setRightPanelOpen(true);
                        } else if (!ctx.wasMobilePanelOpen) {
                            uiStore.closeMobilePanel();
                        } else if (ctx.previousTab && ctx.previousTab !== "search") {
                            uiStore.setLeftPanelTab(ctx.previousTab);
                        }
                    } else if (ctx.previousTab && ctx.previousTab !== "search") {
                        uiStore.setLeftPanelTab(ctx.previousTab);
                    }
                    postStore.openPostDetail(ctx.activePost);
                } else if (isMobile && ctx.wasRightPanelOpen) {
                    uiStore.setRightPanelOpen(true);
                } else if (ctx.previousTab && ctx.previousTab !== "search") {
                    uiStore.setLeftPanelTab(ctx.previousTab);
                }
            }

            return {
                viewingProfile: null,
                viewedProfileData: null,
                returnContext: null,
            };
        }),
}));