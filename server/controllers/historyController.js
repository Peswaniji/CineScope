import WatchHistory from '../models/WatchHistory.js';
import { handleControllerError } from '../utils/handleControllerError.js';

export const getHistory = async (req, res) => {
  try {
    const history = await WatchHistory.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { watchedAt: -1, _id: -1 } },
      {
        $group: {
          _id: '$movieId',
          doc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { watchedAt: -1, _id: -1 } },
      { $limit: 100 },
    ]);
    return res.json(history);
  } catch (error) {
    return handleControllerError(res, 'getHistory', error, 'Unable to load watch history right now.');
  }
};

export const addHistory = async (req, res) => {
  const movieId = String(req.body.movieId || '');
  const title = req.body.title || 'Untitled';
  const poster = req.body.poster || '';

  if (!movieId) {
    return res.status(400).json({ message: 'Movie ID is required.' });
  }

  try {
    let history;
    try {
      history = await WatchHistory.findOneAndUpdate(
        { user: req.user._id, movieId },
        {
          $set: {
            title,
            poster,
            watchedAt: Date.now(),
          },
          $setOnInsert: {
            user: req.user._id,
            movieId,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );
    } catch (error) {
      // Handle race condition when two requests insert same movie at once.
      if (error?.code === 11000) {
        history = await WatchHistory.findOneAndUpdate(
          { user: req.user._id, movieId },
          {
            $set: {
              title,
              poster,
              watchedAt: Date.now(),
            },
          },
          { new: true }
        );
      } else {
        throw error;
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    return handleControllerError(res, 'addHistory', error, 'Unable to save watch history right now.');
  }
};

export const removeHistory = async (req, res) => {
  try {
    const result = await WatchHistory.deleteMany({
      user: req.user._id,
      movieId: String(req.params.movieId),
    });

    if (!result.deletedCount) {
      return res.status(404).json({ message: 'Watch history item not found.' });
    }

    return res.json({ message: 'Removed from watch history.' });
  } catch (error) {
    return handleControllerError(res, 'removeHistory', error, 'Unable to remove watch history item right now.');
  }
};
