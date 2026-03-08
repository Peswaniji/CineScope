import express from 'express';

const router = express.Router();

router.get('/*path', async (req, res) => {
  const tmdbKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY;

  if (!tmdbKey) {
    return res.status(500).json({ message: 'TMDB API key is missing on server.' });
  }

  const path = Array.isArray(req.params.path) ? req.params.path.join('/') : req.params.path;
  const query = new URLSearchParams(req.query);
  query.set('api_key', tmdbKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`https://api.themoviedb.org/3/${path}?${query.toString()}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();
    clearTimeout(timeout);
    return res.status(response.status).json(data);
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return res.status(504).json({ message: 'TMDB request timed out.' });
    }
    console.error('tmdb proxy error:', error);
    return res.status(500).json({ message: 'TMDB proxy request failed.' });
  }
});

export default router;

