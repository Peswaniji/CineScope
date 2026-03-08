import User from '../models/User.js';
import Movie from '../models/Movie.js';
import { handleControllerError } from '../utils/handleControllerError.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return handleControllerError(res, 'getUsers', error, 'Unable to load users right now.');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await user.deleteOne();
    return res.json({ message: 'User removed' });
  } catch (error) {
    return handleControllerError(res, 'deleteUser', error, 'Unable to delete user right now.');
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot ban admin user' });
    }

    const shouldBan = typeof req.body?.isBanned === 'boolean' ? req.body.isBanned : !user.isBanned;
    user.isBanned = shouldBan;
    await user.save();

    const sanitized = await User.findById(user._id).select('-password');
    return res.json(sanitized);
  } catch (error) {
    return handleControllerError(res, 'banUser', error, 'Unable to update user status right now.');
  }
};

export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({}).sort({ createdAt: -1 });
    return res.json(movies);
  } catch (error) {
    return handleControllerError(res, 'getMovies', error, 'Unable to load movies right now.');
  }
};

export const addMovie = async (req, res) => {
  try {
    const { title, posterUrl, description, movieId, releaseDate, trailerLink, genre, category } = req.body;

    if (!title || !posterUrl || !movieId) {
      return res.status(400).json({ message: 'Title, poster URL, and movie ID are required.' });
    }

    const exists = await Movie.findOne({ movieId });
    if (exists) {
      return res.status(400).json({ message: 'Movie with this ID already exists.' });
    }

    const movie = await Movie.create({
      title,
      posterUrl,
      description: description || 'Description not available',
      movieId,
      releaseDate: releaseDate || null,
      trailerLink: trailerLink || '',
      genre: genre || '',
      category: category || '',
    });

    return res.status(201).json(movie);
  } catch (error) {
    return handleControllerError(res, 'addMovie', error, 'Unable to add movie right now.');
  }
};

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.deleteOne();
    return res.json({ message: 'Movie removed' });
  } catch (error) {
    return handleControllerError(res, 'deleteMovie', error, 'Unable to delete movie right now.');
  }
};

export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const fields = ['title', 'posterUrl', 'description', 'movieId', 'releaseDate', 'trailerLink', 'genre', 'category'];
    fields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        movie[field] = req.body[field];
      }
    });

    await movie.save();
    return res.json(movie);
  } catch (error) {
    return handleControllerError(res, 'updateMovie', error, 'Unable to update movie right now.');
  }
};
