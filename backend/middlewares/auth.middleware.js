import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const protect = asyncHandler(async (req, res, next) => {
  const cookieName = process.env.COOKIE_NAME || "geosocial_jwt";
  let token = req.cookies?.[cookieName];

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Unauthorized access, user not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Unauthorized access, token is not valid");
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized access, no token provided");
  }
});

export { protect };
