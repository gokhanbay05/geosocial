import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { USERS, POSTS } from "../seed-data/data.js";

export const runAutoSeed = async () => {
  try {
    const postCount = await Post.countDocuments();
    
    if (postCount > 0) return;

    console.log("🚀 Database empty, initiating auto-seed...");

    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    const createdUsers = {};

    for (const userData of USERS) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        avatarUrl: userData.avatar,
        bio: userData.bio,
        location: { type: "Point", coordinates: [28.9784, 41.0082] }
      });
      createdUsers[user.username] = user;
    }

    for (const postData of POSTS) {
      const author = createdUsers[postData.username];
      if (!author) continue;

      await Post.create({
        author: author._id,
        description: postData.description,
        mediaUrl: postData.image,
        mediaType: "image",
        location: {
          type: "Point",
          coordinates: [postData.longitude, postData.latitude]
        },
        createdAt: new Date(),
        likes: [],
        stats: { likeCount: 0, commentCount: 0 }
      });
    }

    console.log("✅ Auto-seed completed successfully.");
  } catch (error) {
    console.error("❌ Auto-seed error:", error.message);
  }
};