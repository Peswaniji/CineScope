import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_W500, POSTER_PLACEHOLDER } from '../utils/constants.js';

const MovieCard = ({ item, to, subtitle, badge }) => {
  const title = item?.title || item?.name || 'Untitled';
  const posterPath = item?.poster_path || item?.profile_path || item?.poster;

  return (
    <Link
      to={to}
      className="group relative flex-shrink-0 w-[150px] sm:w-[180px] md:w-[210px] rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 transition-all"
    >
      <img
        src={posterPath ? `${IMAGE_BASE_W500}${posterPath}` : POSTER_PLACEHOLDER}
        alt={title}
        className="w-full aspect-[2/3] object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-90" />
      <div className="absolute bottom-0 p-3 w-full">
        <p className="text-sm font-semibold truncate text-white">{title}</p>
        {subtitle ? <p className="text-xs text-slate-300 truncate">{subtitle}</p> : null}
        {badge ? (
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-cyan-400/20 text-cyan-400 border border-cyan-400/40">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-400/10" />
    </Link>
  );
};

export default MovieCard;


