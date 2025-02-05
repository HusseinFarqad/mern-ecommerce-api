import multer from "multer";
import { AppError } from "../utils/AppError.js";

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
  },
});

const fileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new AppError("Only image files are allowed", 400), false);
  }
  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
