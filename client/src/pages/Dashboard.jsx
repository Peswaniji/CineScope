import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites, fetchHistory, removeFavorite, removeHistory } from '../redux/slices/dashboardSlice.js';
import { IMAGE_BASE_W500, POSTER_PLACEHOLDER } from '../utils/constants.js';
import Loader from '../components/Loader.jsx';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { favorites, history, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchFavorites());
    dispatch(fetchHistory());
  }, [dispatch]);

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 md:px-8 pb-16 space-y-12">
      <section>
        <h1 className="text-3xl md:text-4xl font-black text-white">My Dashboard</h1>
        <p className="text-slate-300 mt-2">Manage favorites and recently watched titles.</p>
        {loading ? <Loader text="Syncing dashboard..." /> : null}
        {error ? <p className="text-red-300 mt-2">{error}</p> : null}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Favorites</h2>
        {favorites.length === 0 ? (
          <p className="text-slate-300">No favorites yet. Add from any movie details page.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((item) => {
              const image = item?.poster ? `${IMAGE_BASE_W500}${item.poster}` : POSTER_PLACEHOLDER;
              return (
                <div key={item._id} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <Link to={`/movie/${item.movieId}`}>
                    <img src={image} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate text-white">{item.title || 'Untitled'}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => dispatch(removeFavorite(String(item.movieId)))}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Recent Watch History</h2>
        {history.length === 0 ? (
          <p className="text-slate-300">No history yet. Open a movie or play a trailer to track activity.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.map((item) => {
              const image = item?.poster ? `${IMAGE_BASE_W500}${item.poster}` : POSTER_PLACEHOLDER;
              return (
                <div key={item._id} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                  <Link to={`/movie/${item.movieId}`}>
                    <img src={image} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-semibold truncate text-white">{item.title || 'Untitled'}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(item.watchedAt).toLocaleString()}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => dispatch(removeHistory(String(item.movieId)))}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;


