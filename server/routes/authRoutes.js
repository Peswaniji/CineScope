import express from 'express';
import { authUser, registerUser, getUserProfile, deleteMyAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/me').delete(protect, deleteMyAccount);

export default router;
