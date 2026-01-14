import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
    persist(
        (set) => ({
            theme: "light",
            mapStyle: "basic",
            setTheme: (theme) => set({ theme }),
            setMapStyle: (style) => set({ mapStyle: style }),
        }),
        {
            name: "geosocial-settings",
        }
    )
);