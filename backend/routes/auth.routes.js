import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validation/auth.validation.js";
import { loginLimiter } from "../middlewares/rateLimit.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/register",
  upload.single("avatar"),
  validate(registerSchema),
  registerUser
);
router.post("/login", loginLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

export default router;