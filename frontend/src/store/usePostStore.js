import { create } from "zustand";
import { useUIStore } from "./useUIStore";

export const usePostStore = create((set) => ({
    clusterPosts: null,
    activePost: null,
    viewType: "cluster",

    removePost: (postId) =>
        set((state) => ({
            activePost: state.activePost?._id === postId ? null : state.activePost,
            clusterPosts: state.clusterPosts
                ? state.clusterPosts.filter((p) => (p._id || p.postId) !== postId)
                : null,
        })),

    updatePost: (postId, updates) =>
        set((state) => {
            let updatedActivePost = state.activePost;
            if (state.activePost?._id === postId) {
                updatedActivePost = { ...state.activePost, ...updates };
            }

            let updatedClusterPosts = state.clusterPosts;
            if (updatedClusterPosts) {
                updatedClusterPosts = updatedClusterPosts.map((p) =>
                    p._id === postId ? { ...p, ...updates } : p
                );
            }

            return {
                activePost: updatedActivePost,
                clusterPosts: updatedClusterPosts,
            };
        }),

    replacePost: (post) =>
        set((state) => {
            let updatedActivePost = state.activePost;
            if (state.activePost?._id === post._id) {
                updatedActivePost = post;
            }

            let updatedClusterPosts = state.clusterPosts;
            if (updatedClusterPosts) {
                updatedClusterPosts = updatedClusterPosts.map((p) =>
                    p._id === post._id ? post : p
                );
            }

            return {
                activePost: updatedActivePost,
                clusterPosts: updatedClusterPosts,
            };
        }),

    openCluster: (posts) => {
        set({
            viewType: "cluster",
            clusterPosts: posts,
            activePost: null,
        });
        useUIStore.getState().setRightPanelOpen(true);
    },

    openPostDetail: (post) => set({ activePost: post }),
    closePostDetail: () => set({ activePost: null }),
}));