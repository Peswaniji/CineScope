import Favorite from '../models/Favorite.js';
import { handleControllerError } from '../utils/handleControllerError.js';

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(favorites);
  } catch (error) {
    return handleControllerError(res, 'getFavorites', error, 'Unable to load favorites right now.');
  }
};

export const addFavorite = async (req, res) => {
  const movieId = String(req.body.movieId || '');
  const title = req.body.title || 'Untitled';
  const poster = req.body.poster || '';

  if (!movieId) {
    return res.status(400).json({ message: 'Movie ID is required.' });
  }

  try {
    const exists = await Favorite.findOne({ user: req.user._id, movieId });
    if (exists) {
      return res.status(200).json(exists);
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      movieId,
      title,
      poster,
    });

    return res.status(201).json(favorite);
  } catch (error) {
    return handleControllerError(res, 'addFavorite', error, 'Unable to add favorite right now.');
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      movieId: String(req.params.movieId),
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    return res.json({ message: 'Removed from favorites' });
  } catch (error) {
    return handleControllerError(res, 'removeFavorite', error, 'Unable to remove favorite right now.');
  }
};
