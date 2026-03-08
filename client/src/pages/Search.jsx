import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tmdbApi } from '../redux/api.js';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setPage(1);
      setTotalPages(1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await tmdbApi.get('/search/multi', {
          params: { query: trimmedQuery, page: 1, include_adult: false },
        });

        const sorted = (data?.results || [])
          .filter((item) => item.media_type === 'person' || item.media_type === 'movie' || item.media_type === 'tv')
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        setResults(sorted);
        setPage(1);
        setTotalPages(data?.total_pages || 1);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!trimmedQuery) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || loading || page >= totalPages) return;
        setLoading(true);

        try {
          const nextPage = page + 1;
          const { data } = await tmdbApi.get('/search/multi', {
            params: { query: trimmedQuery, page: nextPage, include_adult: false },
          });
          const merged = [...results, ...(data?.results || [])];
          const unique = merged.filter((item, index, self) => index === self.findIndex((x) => x.id === item.id && x.media_type === item.media_type));
          unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          setResults(unique);
          setPage(nextPage);
        } catch (error) {
          console.error('Search pagination error', error);
        } finally {
          setLoading(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, page, results, totalPages, trimmedQuery]);

  return (
    <div className="max-w-7xl mx-auto pt-24 px-4 md:px-8 pb-16">
      <div className="mb-4 flex items-center gap-3">
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

      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV shows, or actors..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white text-lg focus:border-cyan-400 focus:outline-none"
        />
      </div>

      {loading && results.length === 0 ? <Loader text="Searching..." /> : null}

      {!loading && trimmedQuery && results.length === 0 ? (
        <p className="text-slate-300">No results found for "{trimmedQuery}".</p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((item) => {
          const subtitle = item.media_type === 'person'
            ? item.known_for_department || 'Person'
            : item.release_date || item.first_air_date || 'Date unavailable';

          return (
            <MovieCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              to={item.media_type === 'person' ? '/search' : `/movie/${item.id}`}
              subtitle={subtitle}
              badge={item.media_type}
            />
          );
        })}
      </div>

      <div ref={loadMoreRef} className="pt-6">
        {loading && results.length > 0 ? <Loader text="Loading more results..." /> : null}
      </div>

      <div className="mt-8 text-sm text-slate-400">
        <p>Tip: search terms like "2025 action", "Korean drama", or actor names for better relevance.</p>
      </div>
    </div>
  );
};

export default Search;


