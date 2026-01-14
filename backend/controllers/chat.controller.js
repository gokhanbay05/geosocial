import asyncHandler from "express-async-handler";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const io = req.app.get("socketio");

    let mediaUrl = "";
    let messageType = "text";

    if (req.file) {
        mediaUrl = `/uploads/${req.file.filename}`;
        messageType = "image";
    }

    if (!text && !mediaUrl) {
        res.status(400);
        throw new Error("Message content is required");
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    const newMessage = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        text: text || "",
        messageType,
        mediaUrl,
    });

    if (newMessage) {
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        io.to(receiverId).emit("newMessage", {
            ...newMessage._doc,
            sender: {
                _id: req.user._id,
                username: req.user.username,
                avatarUrl: req.user.avatarUrl
            }
        });
    }

    res.status(201).json(newMessage);
});

const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: { $in: [userId] },
    })
        .sort({ updatedAt: -1 })
        .populate("participants", "username avatarUrl")
        .populate("lastMessage");

    const filteredConversations = conversations
        .map((conv) => {
            const otherParticipant = conv.participants.find(
                (p) => p._id.toString() !== userId.toString()
            );

            // Eğer kullanıcı silinmişse null döndür
            if (!otherParticipant) return null;

            return {
                _id: conv._id,
                otherUser: otherParticipant,
                lastMessage: conv.lastMessage,
                updatedAt: conv.updatedAt,
            };
        })
        .filter((conv) => conv !== null);

    res.json(filteredConversations);
});

const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).sort({
        createdAt: 1,
    });
    res.json(messages);
});

export { sendMessage, getConversations, getMessages };