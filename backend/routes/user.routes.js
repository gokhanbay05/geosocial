import express from "express";
import {
  getMe,
  updateProfile,
  getUserProfile,
  followUser,
  searchUsers,
  updateAccount,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/account", protect, updateAccount);
router.get("/search", searchUsers);
router.get("/:username", getUserProfile);
router.put("/:id/follow", protect, followUser);

export default router;
