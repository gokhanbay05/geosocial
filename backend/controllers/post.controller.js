import asyncHandler from "express-async-handler";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import fs from "fs";
import path from "path";

const createPost = asyncHandler(async (req, res) => {
  const { description, latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error("Location data (latitude, longitude) is required");
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const existingPost = await Post.findOne({ author: req.user._id });
  if (existingPost) {
    res.status(400);
    throw new Error("You can only create one post in 24 hours");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload an image or video");
  }

  const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
  const mediaUrl = `/uploads/${req.file.filename}`;

  const post = await Post.create({
    author: req.user._id,
    description,
    mediaUrl,
    mediaType,
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
  });

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.postCount": 1 },
  });

  const populatedPost = await Post.findById(post._id).populate(
    "author",
    "username avatarUrl"
  );
  res.status(201).json(populatedPost);
});

const getPostsInBounds = asyncHandler(async (req, res) => {
  const { swLat, swLng, neLat, neLng, page = 1, limit = 10, sortBy = "newest" } = req.query;

  if (!swLat || !swLng || !neLat || !neLng) return res.json([]);

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  let sortStage = {};
  switch (sortBy) {
    case "newest": sortStage = { createdAt: -1 }; break;
    case "oldest": sortStage = { createdAt: 1 }; break;
    case "mostLiked": sortStage = { "stats.likeCount": -1, createdAt: -1 }; break;
    default: sortStage = { createdAt: -1 };
  }

  const pipeline = [
    {
      $match: {
        location: {
          $geoWithin: {
            $box: [
              [parseFloat(swLng), parseFloat(swLat)],
              [parseFloat(neLng), parseFloat(neLat)],
            ],
          },
        },
      },
    },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limitNum },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
        pipeline: [{ $project: { username: 1, avatarUrl: 1 } }],
      },
    },
    { $unwind: "$author" },
    {
      $addFields: {
        likeCount: "$stats.likeCount"
      }
    },
    {
      $project: {
        likes: 0,
        __v: 0
      }
    }
  ];

  const posts = await Post.aggregate(pipeline);
  res.json(posts);
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "username avatarUrl"
  );

  if (post) {
    res.json(post);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const likePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  const unlikeResult = await Post.findOneAndUpdate(
    { _id: postId, likes: userId },
    {
      $pull: { likes: userId },
      $inc: { "stats.likeCount": -1, "stats.totalLikesReceived": -1 }
    },
    { new: true }
  );

  if (unlikeResult) {

    await User.findByIdAndUpdate(unlikeResult.author, { $inc: { "stats.totalLikesReceived": -1 } });

    return res.json({ isLiked: false, likeCount: unlikeResult.stats.likeCount });
  }


  const likeResult = await Post.findOneAndUpdate(
    { _id: postId, likes: { $ne: userId } },
    {
      $addToSet: { likes: userId },
      $inc: { "stats.likeCount": 1 }
    },
    { new: true }
  );

  if (likeResult) {
    await User.findByIdAndUpdate(likeResult.author, { $inc: { "stats.totalLikesReceived": 1 } });
    return res.json({ isLiked: true, likeCount: likeResult.stats.likeCount });
  }

  res.status(404);
  throw new Error("Post not found or operation failed");
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Could not find the post");
  }

  if (post.author.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("You are not authorized to delete this post");
  }

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, post.mediaUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Comment.deleteMany({ post: post._id });

  await post.deleteOne();

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.postCount": -1 },
  });

  res.json({ message: "Post deleted" });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.userId })
    .populate("author", "username avatarUrl")
    .sort({ createdAt: -1 });

  res.json(posts);
});

export {
  createPost,
  getPostsInBounds,
  getPostById,
  likePost,
  deletePost,
  getUserPosts,
};
