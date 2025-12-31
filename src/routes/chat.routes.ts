import express from 'express';
import { chatWithAgent } from '../controllers/chat.controller';
const router = express.Router();

router.post('/', chatWithAgent);

export default router;
