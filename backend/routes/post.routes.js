import express from "express";
import {
  createPost,
  getPostsInBounds,
  getPostById,
  likePost,
  deletePost,
  getUserPosts,
} from "../controllers/post.controller.js";
import {
  addComment,
  getPostComments,
} from "../controllers/comment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { postLimiter } from "../middlewares/rateLimit.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/", getPostsInBounds);

router.post(
  "/",
  protect,
  postLimiter,
  upload.single("file"),
  createPost
);

router.get("/user/:userId", getUserPosts);

router.get("/:id", getPostById);
router.put("/:id/like", protect, likePost);
router.delete("/:id", protect, deletePost);

router.post("/:postId/comments", protect, addComment);
router.get("/:postId/comments", getPostComments);

export default router;