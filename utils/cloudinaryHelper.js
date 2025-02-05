import { v2 as cloudinary } from "cloudinary";
import { AppError } from "./AppError.js";

export const uploadToCloudinary = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
    });
    return result.secure_url;
  } catch (error) {
    throw new AppError("Failed to upload image to Cloudinary", 500);
  }
};
