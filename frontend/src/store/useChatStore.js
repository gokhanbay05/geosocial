import { create } from "zustand";
import { getConversations, getMessages, sendMessage } from "../services/chat.service";
import { handleError } from "../lib/errorHandler";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import { getAuthToken } from "../lib/api";

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

        const socketUrl =
            import.meta.env.VITE_SOCKET_URL ||
            (import.meta.env.PROD
                ? "https://geosocial-api.onrender.com"
                : "http://localhost:5000");

        const socket = io(socketUrl, {
            auth: { token: getAuthToken() },
            query: { userId: user._id },
            withCredentials: true,
        });

        set({ socket });

        socket.on("getOnlineUsers", (users) => set({ onlineUsers: users }));

        socket.on("newMessage", (message) => {
            const { selectedConversation } = get();
            const currentUser = useAuthStore.getState().user;

            if (
                !currentUser ||
                message.sender?._id === currentUser._id ||
                message.sender === currentUser._id
            ) {
                return;
            }

            if (
                selectedConversation &&
                selectedConversation._id?.toString() === message.conversation?.toString()
            ) {
                set((state) => {
                    if (state.messages.some((m) => m._id === message._id)) return state;
                    return {
                        messages: [...state.messages, message],
                    };
                });
            }

            const existingConv = get().conversations.some(
                (c) => c._id?.toString() === message.conversation?.toString()
            );

            if (existingConv) {
                set((state) => {
                    const updated = state.conversations.map((conv) =>
                        conv._id?.toString() === message.conversation?.toString()
                            ? {
                                  ...conv,
                                  lastMessage: message,
                                  updatedAt: message.createdAt || new Date().toISOString(),
                              }
                            : conv
                    );
                    updated.sort(
                        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
                    );
                    return { conversations: updated };
                });
            } else {
                get().fetchConversations({ silent: true });
            }
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

    fetchConversations: async ({ silent = false } = {}) => {
        if (!silent && get().conversations.length === 0) {
            set({ isConversationsLoading: true });
        }
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
        set({ isMessagesLoading: true, messages: [] });
        try {
            const data = await getMessages(conversationId);
            // Konuşma değiştiyse eski konuşmanın cevabını ekrana basma (Race condition koruması)
            if (get().selectedConversation?._id !== conversationId) return;
            set({ messages: data, isMessagesLoading: false });
        } catch (error) {
            if (get().selectedConversation?._id === conversationId) {
                set({ isMessagesLoading: false });
            }
            handleError(error, { context: "FetchMessages" });
        }
    },

    sendNewMessage: async (receiverId, formData, optimisticMeta = {}) => {
        const currentUser = useAuthStore.getState().user;
        const { text = "", imagePreview = null } = optimisticMeta;
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const optimisticMessage = {
            _id: tempId,
            conversation: get().selectedConversation?._id || "temp-conv",
            sender: currentUser?._id,
            text,
            messageType: imagePreview ? "image" : "text",
            mediaUrl: imagePreview || "",
            isSending: true,
            createdAt: new Date().toISOString(),
        };

        set((state) => ({
            messages: [...state.messages, optimisticMessage],
        }));

        try {
            const newMessage = await sendMessage(receiverId, formData);

            set((state) => {
                const isStillInTargetChat =
                    state.messages.some((m) => m._id === tempId) ||
                    state.selectedConversation?._id?.toString() ===
                        newMessage.conversation?.toString() ||
                    state.selectedConversation?.otherUser?._id?.toString() ===
                        receiverId?.toString();

                let updatedMessages = state.messages;
                if (isStillInTargetChat) {
                    const alreadyHasReal = state.messages.some(
                        (m) => m._id === newMessage._id
                    );
                    if (alreadyHasReal) {
                        updatedMessages = state.messages.filter((m) => m._id !== tempId);
                    } else if (state.messages.some((m) => m._id === tempId)) {
                        updatedMessages = state.messages.map((m) =>
                            m._id === tempId ? newMessage : m
                        );
                    } else {
                        updatedMessages = [...state.messages, newMessage];
                    }
                }

                let updatedSelectedConv = state.selectedConversation;
                if (
                    state.selectedConversation?.isNewConversation &&
                    state.selectedConversation?.otherUser?._id?.toString() ===
                        receiverId?.toString()
                ) {
                    updatedSelectedConv = {
                        ...state.selectedConversation,
                        _id: newMessage.conversation,
                        isNewConversation: false,
                    };
                }

                // Konuşma listesini ekstra ağ isteği beklemeden anında güncelle
                const convIdStr = newMessage.conversation?.toString();
                const existsInList = state.conversations.some(
                    (c) => c._id?.toString() === convIdStr
                );

                let updatedConversations = state.conversations;
                if (existsInList) {
                    updatedConversations = state.conversations.map((conv) =>
                        conv._id?.toString() === convIdStr
                            ? {
                                  ...conv,
                                  lastMessage: newMessage,
                                  updatedAt:
                                      newMessage.createdAt || new Date().toISOString(),
                              }
                            : conv
                    );
                    updatedConversations.sort(
                        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
                    );
                } else if (updatedSelectedConv?.otherUser) {
                    updatedConversations = [
                        {
                            _id: newMessage.conversation,
                            otherUser: updatedSelectedConv.otherUser,
                            lastMessage: newMessage,
                            updatedAt: newMessage.createdAt || new Date().toISOString(),
                        },
                        ...state.conversations,
                    ];
                }

                return {
                    messages: updatedMessages,
                    selectedConversation: updatedSelectedConv,
                    conversations: updatedConversations,
                };
            });

            return newMessage;
        } catch (error) {
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== tempId),
            }));
            handleError(error, { context: "SendMessage" });
        } finally {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        }
    },

    setSelectedConversation: (conv) =>
        set((state) => {
            const isSameConv =
                Boolean(conv?._id) &&
                state.selectedConversation?._id?.toString() === conv._id.toString();

            if (isSameConv) {
                return { selectedConversation: conv };
            }

            return {
                selectedConversation: conv,
                messages: [],
                isMessagesLoading: Boolean(conv?._id && !conv.isNewConversation),
                typingUsers: {},
            };
        }),
    resetChat: () =>
        set({ selectedConversation: null, messages: [], isMessagesLoading: false }),
}));