import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avi"];
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
  const isExtAllowed = allowedExts.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format!"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
  fileFilter,
});

export default upload;