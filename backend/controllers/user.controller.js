import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("followers", "username avatarUrl")
    .populate("following", "username avatarUrl");

  res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.bio = req.body.bio || user.bio;

    if (req.file) {
      user.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .select("-password -email")
    .populate("followers", "username avatarUrl")
    .populate("following", "username avatarUrl");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  if (targetUserId.toString() === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  const currentUser = await User.findById(currentUserId);

  if (!targetUser || !currentUser) {
    res.status(404);
    throw new Error("User not found");
  }

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    await currentUser.updateOne({
      $pull: { following: targetUserId },
      $inc: { "stats.followingCount": -1 },
    });
    await targetUser.updateOne({
      $pull: { followers: currentUserId },
      $inc: { "stats.followerCount": -1 },
    });
    res.json({ message: "Unfollowed successfully", isFollowing: false });
  } else {
    await currentUser.updateOne({
      $addToSet: { following: targetUserId },
      $inc: { "stats.followingCount": 1 },
    });
    await targetUser.updateOne({
      $addToSet: { followers: currentUserId },
      $inc: { "stats.followerCount": 1 },
    });
    res.json({ message: "Followed successfully", isFollowing: true });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.json([]);
  }

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { bio: { $regex: q, $options: "i" } },
    ],
  })
    .select("username avatarUrl bio")
    .limit(10);

  res.json(users);
});

const updateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { email, currentPassword, newPassword } = req.body;

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }

  if (newPassword) {
    if (!currentPassword) {
      res.status(400);
      throw new Error("Please provide current password to change password");
    }

    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword;
    } else {
      res.status(401);
      throw new Error("Invalid current password");
    }
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    avatarUrl: updatedUser.avatarUrl,
    bio: updatedUser.bio,
  });
});

export { getMe, updateProfile, getUserProfile, followUser, searchUsers, updateAccount };
