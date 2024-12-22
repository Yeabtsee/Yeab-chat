import express from 'express';
import { putConversations, getConversations} from '../controllers/search.js';

const router = express.Router();

router.post('/', getConversations);
router.get('/:userId', getConversations);
router.put('/', putConversations);

export default router;