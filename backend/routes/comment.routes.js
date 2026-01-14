import express from "express";
import {
  getPostComments,
  addComment,
  getCommentReplies,
  likeComment,
} from "../controllers/comment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { commentLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.get("/post/:postId", getPostComments);
router.post("/post/:postId", protect, commentLimiter, addComment);
router.get("/:commentId/replies", getCommentReplies);

router.put("/:commentId/like", protect, likeComment);

export default router;