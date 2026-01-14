import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { text, parentId } = req.body;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = await Comment.create({
    post: postId,
    author: req.user._id,
    text,
    parentId: parentId || null,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { "stats.commentCount": 1 } });

  if (parentId) {
    await Comment.findByIdAndUpdate(parentId, { $inc: { replyCount: 1 } });
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "username avatarUrl"
  );

  res.status(201).json(populatedComment);
});

const getPostComments = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const { sortBy = "newest", page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  let sortStage = {};

  switch (sortBy) {
    case "newest":
      sortStage = { createdAt: -1 };
      break;
    case "oldest":
      sortStage = { createdAt: 1 };
      break;
    case "mostLiked":
      sortStage = { likeCount: -1, createdAt: -1 };
      break;
    default:
      sortStage = { createdAt: -1 };
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        post: new mongoose.Types.ObjectId(postId),
        parentId: null,
      },
    },
    {
      $addFields: {
        likeCount: { $size: { $ifNull: ["$likes", []] } },
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
  ]);

  res.json(comments);
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;

  const replies = await Comment.find({ parentId: commentId })
    .populate("author", "username avatarUrl")
    .sort({ createdAt: 1 });

  res.json(replies);
});

const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const isLiked = comment.likes.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (isLiked) {
    await comment.updateOne({
      $pull: { likes: req.user._id },
      $inc: { likeCount: -1 },
    });
    res.json({ isLiked: false });
  } else {
    await comment.updateOne({
      $addToSet: { likes: req.user._id },
      $inc: { likeCount: 1 },
    });
    res.json({ isLiked: true });
  }
});

export { addComment, getPostComments, getCommentReplies, likeComment };
