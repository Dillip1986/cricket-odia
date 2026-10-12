import React from 'react';

/** Loading placeholder grid that mirrors match-card dimensions (no layout shift). */
export const MatchGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
      aria-busy="true"
      aria-label="Loading matches"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 space-y-3" aria-hidden="true">
          <div className="flex items-center justify-between">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-5 w-16" />
          </div>
          <div className="skeleton h-6 w-3/4" />
          <div className="skeleton h-6 w-2/3" />
          <div className="skeleton h-8 w-full" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
};
