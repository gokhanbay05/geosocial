import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import Post from "./models/Post.js";
import Comment from "./models/Comment.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import { USERS, POSTS } from "./seed-data/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SAMPLE_IMAGES_DIR = path.join(__dirname, "seed-data");
const UPLOADS_DIR = path.join(__dirname, "uploads");

const copyImage = (filename, prefix) => {
    if (!fs.existsSync(path.join(SAMPLE_IMAGES_DIR, filename))) {
        console.warn(`Warning: File '${filename}' not found in seed-data. Returning empty path.`);
        return "";
    }

    const ext = path.extname(filename);
    const uniqueName = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;

    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR);
    }

    fs.copyFileSync(
        path.join(SAMPLE_IMAGES_DIR, filename),
        path.join(UPLOADS_DIR, uniqueName)
    );

    return `/uploads/${uniqueName}`;
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");

        console.log("Cleaning database...");
        await User.deleteMany({});
        await Post.deleteMany({});
        await Comment.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});

        if (fs.existsSync(UPLOADS_DIR)) {
            const files = fs.readdirSync(UPLOADS_DIR);
            for (const file of files) {
                if (file !== ".gitkeep") {
                    fs.unlinkSync(path.join(UPLOADS_DIR, file));
                }
            }
        }

        console.log("Creating users...");
        const createdUsers = {};

        for (const userData of USERS) {
            const avatarPath = copyImage(userData.avatar, "avatar");

            const user = await User.create({
                username: userData.username,
                email: userData.email,
                password: userData.password,
                avatarUrl: avatarPath,
                bio: userData.bio,
                location: { type: "Point", coordinates: [28.9784, 41.0082] }
            });

            createdUsers[user.username] = user;
            console.log(`   + ${user.username} created.`);
        }

        console.log("Placing posts...");

        for (const postData of POSTS) {
            const author = createdUsers[postData.username];

            if (!author) {
                console.warn(`   Warning: User '${postData.username}' not found, skipping post.`);
                continue;
            }

            const mediaPath = copyImage(postData.image, "post");
            const createdAt = new Date(Date.now() - Math.floor(Math.random() * 2 * 60 * 60 * 1000));

            await Post.create({
                author: author._id,
                description: postData.description,
                mediaUrl: mediaPath,
                mediaType: "image",
                location: {
                    type: "Point",
                    coordinates: [postData.longitude, postData.latitude]
                },
                createdAt: createdAt,
                likes: [],
                stats: { likeCount: 0, commentCount: 0 }
            });
            console.log(`   + Post added: ${postData.description.substring(0, 30)}...`);
        }

        console.log("\nSeed operation completed successfully.");
        console.log("-> You can now start the project with 'npm run dev' to see the demo data.");
        process.exit(0);

    } catch (error) {
        console.error("Seed Error:", error);
        process.exit(1);
    }
};

seedData();