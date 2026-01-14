import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    stats: {
      likeCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

postSchema.index({ location: "2dsphere" });
postSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("Post", postSchema);
