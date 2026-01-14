import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    sendMessage,
    getConversations,
    getMessages,
} from "../controllers/chat.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/messages/:conversationId", protect, getMessages);

router.post("/send/:id", protect, upload.single("image"), sendMessage);

export default router;