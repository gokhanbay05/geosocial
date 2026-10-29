import { create } from "zustand";

export const useUIStore = create((set) => ({
    isRightPanelOpen: false,
    isMobilePanelOpen: false,
    activeModal: null,
    modalData: null,
    leftPanelTab: "profile",
    refreshTrigger: 0,

    triggerRefresh: () =>
        set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

    setLeftPanelTab: (tab) =>
        set(() => ({
            leftPanelTab: tab,
            isMobilePanelOpen: true,
        })),

    closeMobilePanel: () => set({ isMobilePanelOpen: false }),

    showMapOnMobile: () =>
        set({ isMobilePanelOpen: false, isRightPanelOpen: false }),

    openModal: (modalName, data = null) =>
        set({ activeModal: modalName, modalData: data }),

    closeModal: () => set({ activeModal: null, modalData: null }),

    setRightPanelOpen: (isOpen) =>
        set((state) => ({
            isRightPanelOpen: isOpen,
            isMobilePanelOpen: isOpen ? false : state.isMobilePanelOpen,
        })),

    closeRightPanel: () =>
        set({ isRightPanelOpen: false }),
}));