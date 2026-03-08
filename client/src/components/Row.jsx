import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMoviesByEndpoint } from '../redux/slices/movieSlice.js';
import MovieCard from './MovieCard.jsx';
import Loader from './Loader.jsx';

const Row = ({ title, fetchUrl, fetchKey, subtitleMapper }) => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const entry = useSelector((state) => state.movies.data[fetchKey]);
  const loading = useSelector((state) => state.movies.loadingKeys[fetchKey]);
  const error = useSelector((state) => state.movies.errorByKey[fetchKey]);

  useEffect(() => {
    if (!entry?.items?.length) {
      dispatch(fetchMoviesByEndpoint({ key: fetchKey, endpoint: fetchUrl, page: 1 }));
    }
  }, [dispatch, entry?.items?.length, fetchKey, fetchUrl]);

  const onScroll = () => {
    if (!scrollRef.current || loading || !entry) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    if (scrollLeft + clientWidth >= scrollWidth - 320) {
      dispatch(fetchMoviesByEndpoint({ key: fetchKey, endpoint: fetchUrl, page: (entry.page || 1) + 1 }));
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between px-4 md:px-8">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>
      <div ref={scrollRef} onScroll={onScroll} className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-2 custom-scrollbar">
        {(entry?.items || []).map((item) => (
          <MovieCard
            key={`${fetchKey}-${item.id}`}
            item={item}
            to={item?.media_type === 'person' ? '/search' : `/movie/${item.id}`}
            subtitle={subtitleMapper ? subtitleMapper(item) : item?.release_date || item?.first_air_date || 'Release date unavailable'}
            badge={item?.media_type || (item?.name ? 'tv' : 'movie')}
          />
        ))}
      </div>
      {error ? (
        <div className="px-4 md:px-8 text-sm text-red-300">
          {title}: failed to load. Please refresh.
        </div>
      ) : null}
      {loading ? <Loader text="Loading more titles..." /> : null}
    </section>
  );
};

export default Row;


