import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL],
        methods: ["GET", "POST"],
        credentials: true
    },
});

const userSocketMap = {};

io.use((socket, next) => {
    try {
        const rawCookies = socket.handshake.headers.cookie;
        if (!rawCookies) return next(new Error("Authentication error"));

        const parsedCookies = parse(rawCookies);
        const token = parsedCookies[process.env.COOKIE_NAME];

        if (!token) return next(new Error("Token not found"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error("Internal error"));
    }
});

io.on("connection", (socket) => {
    const userId = socket.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
        socket.join(userId);
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("typing", ({ conversationId, receiverId }) => {
        io.to(receiverId).emit("typing", { conversationId });
    });

    socket.on("stopTyping", ({ conversationId, receiverId }) => {
        io.to(receiverId).emit("stopTyping", { conversationId });
    });

    socket.on("disconnect", () => {
        if (userId && userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { app, io, server };