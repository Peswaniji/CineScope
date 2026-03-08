import express from 'express';
import { getHistory, addHistory, removeHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getHistory).post(protect, addHistory);
router.route('/:movieId').delete(protect, removeHistory);

export default router;
