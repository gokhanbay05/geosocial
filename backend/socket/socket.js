import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

dotenv.config();

const app = express();
const server = createServer(app);

const allowedOrigins = [
    process.env.CLIENT_URL?.replace(/\/$/, ""),
    "http://localhost:5173",
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const userSocketMap = {};

io.use((socket, next) => {
    try {
        const cookieName = process.env.COOKIE_NAME || "geosocial_jwt";
        let token = socket.handshake.auth?.token;

        if (!token && socket.handshake.headers.cookie) {
            const parsedCookies = parse(socket.handshake.headers.cookie);
            token = parsedCookies[cookieName];
        }

        if (!token) return next(new Error("Authentication error"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error("Authentication error"));
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