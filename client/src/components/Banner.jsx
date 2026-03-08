import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tmdbApi } from '../redux/api.js';
import requests from '../requests.js';
import { BACKDROP_PLACEHOLDER, IMAGE_BASE_ORIGINAL } from '../utils/constants.js';
import Loader from './Loader.jsx';

const Banner = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBanner = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await tmdbApi.get(requests.trendingAll);
      const list = data?.results || [];
      setItem(list[Math.floor(Math.random() * list.length)] || null);
    } catch (error) {
      console.error('Failed to load banner', error);
      setError('Could not load TMDB data right now.');
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  if (loading) {
    return (
      <section className="h-[60vh] flex items-center justify-center">
        <Loader text="Loading spotlight..." />
      </section>
    );
  }

  const title = item?.title || item?.name || 'Featured Release';
  const overview = item?.overview || 'Description not available';
  const image = item?.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${item.backdrop_path}` : BACKDROP_PLACEHOLDER;

  return (
    <header className="relative min-h-[62vh] md:min-h-[72vh] flex items-end overflow-hidden">
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-14 md:pb-20">
        {error ? (
          <div className="mb-4 inline-flex items-center gap-3 rounded-lg border border-red-300/40 bg-red-300/10 px-3 py-2 text-sm text-red-300">
            <span>{error} Check internet/API key and retry.</span>
            <button
              onClick={fetchBanner}
              className="rounded-md border border-red-300/40 px-2 py-1 text-xs hover:bg-red-300/20"
            >
              Retry
            </button>
          </div>
        ) : null}
        <p className="text-cyan-400 font-semibold mb-2 tracking-wide uppercase text-xs">Spotlight</p>
        <h1 className="text-4xl md:text-6xl font-black text-white max-w-3xl">{title}</h1>
        <p className="text-slate-200 mt-4 max-w-2xl leading-relaxed">{overview}</p>
        {item?.id ? (
          <Link
            to={`/movie/${item.id}`}
            className="inline-flex mt-6 px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:opacity-90"
          >
            View Details
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Banner;


