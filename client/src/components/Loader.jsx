import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-slate-300">
      <span className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce" />
      <span className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
      <span className="inline-block h-3 w-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default Loader;


