import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinaryConfig.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures", // Folder name in Cloudinary
    format: async (req, file) => "png", // Convert to PNG
    public_id: (req, file) => `profile_${Date.now()}`, // Unique filename
  },
});

const upload = multer({ storage });

export default upload;
