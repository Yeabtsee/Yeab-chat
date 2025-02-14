import express from "express";
import {
  putConversations,
  getConversations,
  getPrivateConvo,
  uploadImage,
} from "../controllers/search.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", getConversations);
router.get("/:userId", getConversations);
router.get("/:username/:targetUsername", getPrivateConvo);
router.put("/", putConversations);
router.post("/upload-image", upload.single("image"), uploadImage);

export default router;
