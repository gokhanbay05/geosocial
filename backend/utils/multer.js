import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    const randomName = crypto.randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();

    const prefix = file.fieldname === "avatar" ? "avatar" : "post";

    cb(null, `${prefix}-${randomName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avi"];
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
  const isExtAllowed = allowedExts.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format or extension"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  },
});

export default upload;