import User from '../models/User.js';
import Favorite from '../models/Favorite.js';
import WatchHistory from '../models/WatchHistory.js';
import generateToken from '../utils/generateToken.js';
import { handleControllerError } from '../utils/handleControllerError.js';

export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account is banned. Contact admin.' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      token: generateToken(user._id),
    });
  } catch (error) {
    return handleControllerError(res, 'authUser', error, 'Unable to log in right now. Please try again.');
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const userExists = await User.findOne({ email: email?.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      token: generateToken(user._id),
    });
  } catch (error) {
    return handleControllerError(res, 'registerUser', error, 'Unable to register right now. Please try again.');
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
    });
  } catch (error) {
    return handleControllerError(res, 'getUserProfile', error, 'Unable to fetch profile right now.');
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await Promise.all([
      Favorite.deleteMany({ user: req.user._id }),
      WatchHistory.deleteMany({ user: req.user._id }),
      user.deleteOne(),
    ]);

    return res.json({ message: 'Your account has been deleted.' });
  } catch (error) {
    return handleControllerError(res, 'deleteMyAccount', error, 'Unable to delete account right now.');
  }
};
