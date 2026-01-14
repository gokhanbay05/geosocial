import { create } from "zustand";

export const useUIStore = create((set) => ({
    isRightPanelOpen: false,
    activeModal: null,
    modalData: null,
    leftPanelTab: "profile",
    refreshTrigger: 0,

    triggerRefresh: () =>
        set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

    setLeftPanelTab: (tab) =>
        set((state) => {
            if (tab === "profile") {
                return {
                    leftPanelTab: tab,
                };
            }
            return { leftPanelTab: tab };
        }),

    openModal: (modalName, data = null) =>
        set({ activeModal: modalName, modalData: data }),

    closeModal: () => set({ activeModal: null, modalData: null }),

    setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }),

    closeRightPanel: () =>
        set({ isRightPanelOpen: false }),
}));