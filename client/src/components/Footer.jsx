import React from 'react';
import { APP_NAME } from '../utils/constants.js';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm text-slate-400 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p>{new Date().getFullYear()} {APP_NAME}. Explore movies, shows, and people.</p>
        <p>Built with TMDB API, React, Redux Toolkit, Node.js, and MongoDB.</p>
      </div>
    </footer>
  );
};

export default Footer;


