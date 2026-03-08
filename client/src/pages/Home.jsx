import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Banner from '../components/Banner.jsx';
import Row from '../components/Row.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import requests from '../requests.js';
import { fetchMoviesByEndpoint } from '../redux/slices/movieSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const loadMoreRef = useRef(null);
  const feedKey = 'popularFeed';
  const feed = useSelector((state) => state.movies.data[feedKey]);
  const feedLoading = useSelector((state) => state.movies.loadingKeys[feedKey]);

  useEffect(() => {
    if (!feed?.items?.length) {
      dispatch(fetchMoviesByEndpoint({ key: feedKey, endpoint: requests.popularMovies, page: 1 }));
    }
  }, [dispatch, feed?.items?.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || feedLoading || !feed) return;
        if (feed.page >= feed.totalPages) return;
        dispatch(
          fetchMoviesByEndpoint({
            key: feedKey,
            endpoint: requests.popularMovies,
            page: (feed.page || 1) + 1,
          })
        );
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [dispatch, feed, feedLoading]);

  return (
    <div className="pb-16">
      <Banner />
      <div className="relative z-10 mt-10 space-y-10">
        <Row title="Trending" fetchUrl={requests.trendingAll} fetchKey="trendingAll" />
        <Row title="Popular Movies" fetchUrl={requests.popularMovies} fetchKey="popularMovies" />
        <Row title="Movies" fetchUrl={requests.topRatedMovies} fetchKey="topRatedMovies" />
        <Row title="TV Shows" fetchUrl={requests.popularTV} fetchKey="popularTV" />
        <Row title="People" fetchUrl={requests.trendingPeople} fetchKey="trendingPeople" subtitleMapper={(p) => p.known_for_department || 'Person'} />

        <section className="px-4 md:px-8">
          <h2 className="text-2xl font-bold text-white mb-4">Discover More (Infinite Scroll)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(feed?.items || []).map((item) => (
              <MovieCard
                key={`feed-${item.id}`}
                item={item}
                to={`/movie/${item.id}`}
                subtitle={item.release_date || 'Release date unavailable'}
                badge="movie"
              />
            ))}
          </div>
          <div ref={loadMoreRef} className="py-4">
            {feedLoading ? <Loader text="Fetching more movies..." /> : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


