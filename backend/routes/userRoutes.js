import express from "express";
import {
  registerUser,
  loginUser,
  updateAvatar,
} from "../controllers/userController.js";
import {
  updateUserProfile,
  getUserProfile,
  getAllProfiles,
} from "../controllers/search.js";
import {
  ForgotPassword,
  ResetPassword,
} from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profiles", getAllProfiles);
router.post("/:username/upload-avatar", upload.single("avatar"), updateAvatar);
router.put("/:username", updateUserProfile);
router.get("/:username", getUserProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);

export default router;
