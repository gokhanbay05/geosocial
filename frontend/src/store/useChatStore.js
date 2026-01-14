import { create } from "zustand";
import { getConversations, getMessages, sendMessage } from "../services/chat.service";
import { handleError } from "../lib/errorHandler";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    conversations: [],
    messages: [],
    selectedConversation: null,
    isConversationsLoading: false,
    isMessagesLoading: false,
    socket: null,
    onlineUsers: [],
    typingUsers: {},

    connectSocket: () => {
        const { user } = useAuthStore.getState();
        if (!user || get().socket) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL, {
            query: { userId: user._id },
            withCredentials: true,
        });

        set({ socket });

        socket.on("getOnlineUsers", (users) => set({ onlineUsers: users }));

        socket.on("newMessage", (message) => {
            const { selectedConversation, messages } = get();
            const currentUser = useAuthStore.getState().user;

            if (message.sender._id === currentUser._id || message.sender === currentUser._id) return;

            if (selectedConversation && (selectedConversation._id === message.conversation)) {
                set((state) => ({
                    messages: [...state.messages, message],
                }));
            }

            get().fetchConversations();
        });

        socket.on("typing", ({ conversationId }) => {
            set((state) => ({ typingUsers: { ...state.typingUsers, [conversationId]: true } }));
        });

        socket.on("stopTyping", ({ conversationId }) => {
            set((state) => ({ typingUsers: { ...state.typingUsers, [conversationId]: false } }));
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    fetchConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const data = await getConversations();
            set({ conversations: data });
        } catch (error) {
            handleError(error, { context: "FetchConversations" });
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    fetchMessages: async (conversationId) => {
        set({ isMessagesLoading: true });
        try {
            const data = await getMessages(conversationId);
            set({ messages: data });
        } catch (error) {
            handleError(error, { context: "FetchMessages" });
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendNewMessage: async (receiverId, messageData) => {
        try {
            const newMessage = await sendMessage(receiverId, messageData);

            set((state) => {
                if (state.messages.some(m => m._id === newMessage._id)) return state;

                const newState = { messages: [...state.messages, newMessage] };

                if (state.selectedConversation?.isNewConversation) {
                    newState.selectedConversation = {
                        ...state.selectedConversation,
                        _id: newMessage.conversation,
                        isNewConversation: false
                    };
                }
                return newState;
            });

            get().fetchConversations();
            return newMessage;
        } catch (error) {
            handleError(error, { context: "SendMessage" });
        }
    },

    setSelectedConversation: (conv) => set({ selectedConversation: conv, typingUsers: {} }),
    resetChat: () => set({ selectedConversation: null, messages: [] }),
}));