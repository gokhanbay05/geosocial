import api from "../lib/api";

export const getConversations = async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await api.get(`/chat/messages/${conversationId}`);
    return response.data;
};

export const sendMessage = async (receiverId, messageData) => {
    const response = await api.post(`/chat/send/${receiverId}`, messageData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};