import express from 'express';
import { putConversations, getConversations, getPrivateConvo} from '../controllers/search.js';

const router = express.Router();

router.post('/', getConversations);
router.get('/:userId', getConversations);
router.get('/:username/:targetUsername', getPrivateConvo);
router.put('/', putConversations);

export default router;