import { create } from "zustand";
import { login, logout, register, getMe } from "../services/auth.service";
import { handleError } from "../lib/errorHandler";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isCheckingAuth: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  signup: async (userData) => {
    set({ isSigningUp: true });
    try {
      const user = await register(userData);
      set({ user, isAuthenticated: true, isSigningUp: false });
      return { success: true };
    } catch (error) {
      set({ isSigningUp: false });
      return { success: false, message: error };
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const user = await login(credentials);
      set({ user, isAuthenticated: true, isLoggingIn: false });
      return { success: true };
    } catch (error) {
      set({ isLoggingIn: false });
      return { success: false, message: error };
    }
  },

  logout: async () => {
    try {
      await logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      handleError(error, { context: "Logout" });
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  updateFollowStatus: (userId, follow) =>
    set((state) => {
      if (!state.user) return state;

      const currentFollowing = state.user.following || [];
      let newFollowing;

      if (follow) {
        if (!currentFollowing.includes(userId)) {
          newFollowing = [...currentFollowing, userId];
        } else {
          return state;
        }
      } else {
        newFollowing = currentFollowing.filter((id) => (id._id || id).toString() !== userId.toString());
      }

      return {
        user: {
          ...state.user,
          following: newFollowing,
          stats: {
            ...state.user.stats,
            followingCount: follow
              ? (state.user.stats?.followingCount || 0) + 1
              : Math.max((state.user.stats?.followingCount || 1) - 1, 0),
          },
        },
      };
    }),
}));