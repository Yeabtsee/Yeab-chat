import express from 'express';
import { registerUser, loginUser, updateAvatar} from '../controllers/userController.js';
import { updateUserProfile,getUserProfile, getAllProfiles } from '../controllers/search.js';
import { ForgotPassword, ResetPassword } from '../controllers/userController.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Create a folder to store uploaded files (if not already present)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const UPLOADS_FOLDER = path.join(__dirname, "../uploads"); // Root-level "uploads" folder

if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'), false);
    }
  };
  
  const upload = multer({ storage, fileFilter });

const router = express.Router();

router.get('/profiles', getAllProfiles);
router.post("/:username/upload-avatar", upload.single("avatar"), updateAvatar);
router.put('/:username', updateUserProfile);
router.get('/:username', getUserProfile);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', ForgotPassword);
router.post('/reset-password', ResetPassword);

export default router;