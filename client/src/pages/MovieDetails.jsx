import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { tmdbApi } from '../redux/api.js';
import { addFavorite, addToHistory, fetchFavorites, removeFavorite } from '../redux/slices/dashboardSlice.js';
import { BACKDROP_PLACEHOLDER, IMAGE_BASE_ORIGINAL, IMAGE_BASE_W500, POSTER_PLACEHOLDER } from '../utils/constants.js';
import Loader from '../components/Loader.jsx';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { favorites } = useSelector((state) => state.dashboard);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      try {
        const { data } = await tmdbApi.get(`/movie/${id}`, {
          params: { append_to_response: 'videos,images,credits' },
        });
        setMovie(data);

        const trailer = (data?.videos?.results || []).find(
          (video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
        );
        setTrailerKey(trailer?.key || '');

        if (userInfo) {
          dispatch(
            addToHistory({
              movieId: String(id),
              title: data?.title || data?.original_title || 'Untitled',
              poster: data?.poster_path || '',
            })
          );
        }
      } catch (error) {
        console.error('Error fetching movie details', error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [dispatch, id, userInfo]);

  const isFavorite = useMemo(
    () => favorites?.some((item) => String(item.movieId) === String(id)),
    [favorites, id]
  );

  const handleFavorite = () => {
    if (!userInfo) {
      alert('Please log in to manage favorites.');
      return;
    }

    if (isFavorite) {
      dispatch(removeFavorite(String(id)));
      return;
    }

    dispatch(
      addFavorite({
        movieId: String(id),
        title: movie?.title || movie?.original_title || 'Untitled',
        poster: movie?.poster_path || '',
      })
    );
  };

  const openTrailer = () => {
    if (!trailerKey) return;
    setShowTrailer(true);

    if (userInfo && movie) {
      dispatch(
        addToHistory({
          movieId: String(id),
          title: movie?.title || movie?.original_title || 'Untitled',
          poster: movie?.poster_path || '',
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen">
        <Loader text="Loading movie details..." />
      </div>
    );
  }

  if (!movie) {
    return <div className="pt-24 min-h-screen flex items-center justify-center text-slate-300">Movie not found.</div>;
  }

  const title = movie.title || movie.original_title || 'Untitled';
  const backdrop = movie.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${movie.backdrop_path}` : BACKDROP_PLACEHOLDER;
  const poster = movie.poster_path ? `${IMAGE_BASE_W500}${movie.poster_path}` : POSTER_PLACEHOLDER;
  const mediaImages = (movie.images?.backdrops || []).slice(0, 8);

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
          >
            ← Back
          </button>
          <Link
            to="/"
            className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:opacity-90 transition"
          >
            Home
          </Link>
        </div>
      </div>
      <section className="relative min-h-[56vh] md:min-h-[68vh]">
        <img src={backdrop} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-[250px,1fr] gap-8 items-end">
          <img src={poster} alt={title} className="w-[220px] md:w-[250px] rounded-xl border border-slate-700 shadow-2xl" />
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{title}</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-2.5 py-1 rounded-full border border-cyan-400/50 text-cyan-400">
                {movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'Not rated'}
              </span>
              <span className="px-2.5 py-1 rounded-full border border-slate-600 text-slate-300">
                {movie.release_date || 'Release date unavailable'}
              </span>
              <span className="px-2.5 py-1 rounded-full border border-slate-600 text-slate-300">
                {movie.runtime ? `${movie.runtime} min` : 'Runtime unavailable'}
              </span>
            </div>
            <p className="text-slate-200 leading-relaxed max-w-3xl">{movie.overview || 'Description not available'}</p>
            <p className="text-sm text-slate-300">Genres: {movie.genres?.map((g) => g.name).join(', ') || 'Not available'}</p>
            <div className="pt-1 flex flex-wrap gap-3">
              <button
                onClick={openTrailer}
                className="px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:opacity-90 disabled:opacity-40"
                disabled={!trailerKey}
              >
                {trailerKey ? 'Watch Trailer' : 'Trailer not available'}
              </button>
              <button
                onClick={handleFavorite}
                className="px-5 py-2.5 rounded-lg border border-slate-600 text-white font-semibold hover:border-cyan-400"
              >
                {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        <h2 className="text-2xl font-bold text-white mb-4">Images / Media</h2>
        {mediaImages.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mediaImages.map((img) => (
              <img
                key={img.file_path}
                src={`${IMAGE_BASE_ORIGINAL}${img.file_path}`}
                alt={`${title} media`}
                className="w-full aspect-video object-cover rounded-lg border border-slate-700"
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-300">Media not available.</p>
        )}
      </section>

      {showTrailer ? (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm p-4 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-black rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h2 className="font-semibold text-white">{title} Trailer</h2>
              <button onClick={() => setShowTrailer(false)} className="text-slate-300 hover:text-white">
                Close
              </button>
            </div>
            {trailerKey ? (
              <div className="aspect-video bg-black">
                <iframe
                  title={`${title} trailer`}
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-300">Trailer for this movie is currently unavailable.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MovieDetails;
