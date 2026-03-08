import express from 'express';
import { getUsers, deleteUser, banUser, getMovies, addMovie, deleteMovie, updateMovie } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser).put(protect, admin, banUser);

router.route('/movies').get(protect, admin, getMovies).post(protect, admin, addMovie);
router.route('/movies/:id').delete(protect, admin, deleteMovie).put(protect, admin, updateMovie);

export default router;
