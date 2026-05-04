import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Heart, X, Check, Eye, Sparkles, ThumbsDown } from 'lucide-react';
import { Movie } from '../types';
import LazyImage from './ui/LazyImage';

interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  active: boolean;
  dragX?: any;
  dragY?: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ movie, onSwipe, active, dragX, dragY }) => {
  const x = dragX || useMotionValue(0);
  const y = dragY || useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const dislikeOpacity = useTransform(x, [-150, -50], [1, 0]);
  const loveOpacity = useTransform(y, [-150, -50], [1, 0]);
  const mehOpacity = useTransform(y, [50, 150], [0, 1]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    } else if (info.offset.y < -threshold) {
      onSwipe('up');
    } else if (info.offset.y > threshold) {
      onSwipe('down');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  if (!active) return null;

  return (
    <motion.div
      style={{ x, y, rotate, opacity, zIndex: 10 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        {/* Ratings & Match Score Layer */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {movie.matchScore && (
            <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles size={12} /> {movie.matchScore}% MATCH
            </div>
          )}
          <div className="flex gap-2">
            {movie.imdbRating && (
              <div className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black tracking-tighter">
                IMDb {movie.imdbRating.split('/')[0]}
              </div>
            )}
            {movie.rottenTomatoes && (
              <div className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black tracking-tighter">
                RT {movie.rottenTomatoes}
              </div>
            )}
          </div>
          {movie.availableOn && movie.availableOn.length > 0 && (
            <div className="flex gap-1.5 mt-1">
              {movie.availableOn.slice(0, 3).map(p => (
                <div key={p} className="bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/80">
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Poster */}
        <LazyImage 
          src={movie.posterPath} 
          alt={movie.title} 
          className="w-full h-full object-cover pointer-events-none"
        />
        
        {/* Overlays for Feedback */}
        <motion.div 
          style={{ opacity: likeOpacity, scale: useTransform(x, [50, 150], [0.8, 1]) }} 
          className="absolute top-20 left-10 z-30 pointer-events-none"
        >
          <div className="border-4 border-green-500 text-green-500 font-black px-6 py-3 rounded-2xl rotate-[-15deg] uppercase text-4xl bg-green-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            Watchlist
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: dislikeOpacity, scale: useTransform(x, [-150, -50], [1, 0.8]) }} 
          className="absolute top-20 right-10 z-30 pointer-events-none"
        >
          <div className="border-4 border-red-500 text-red-500 font-black px-6 py-3 rounded-2xl rotate-[15deg] uppercase text-4xl bg-red-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            Passa
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: loveOpacity, scale: useTransform(y, [-150, -50], [1, 0.8]) }} 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        >
          <div className="border-4 border-indigo-500 text-indigo-500 font-black px-8 py-4 rounded-2xl uppercase text-4xl bg-indigo-500/10 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.4)] flex flex-col items-center gap-2">
            <Heart size={40} fill="currentColor" />
            Visto & Like
          </div>
        </motion.div>

        <motion.div 
          style={{ opacity: mehOpacity, scale: useTransform(y, [50, 150], [0.8, 1]) }} 
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="border-4 border-amber-500 text-amber-500 font-black px-6 py-3 rounded-2xl uppercase text-3xl bg-amber-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2">
            <ThumbsDown size={28} fill="currentColor" />
            Visto & No
          </div>
        </motion.div>

        {/* Info Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent p-6 flex flex-col justify-end">
          <div className="flex justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {movie.title}
              </h2>
              <div className="flex gap-2 mt-2">
                {movie.genres?.slice(0, 3).map(g => (
                  <span key={g} className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-wider text-gray-300 backdrop-blur-sm border border-white/5">{g}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-bold text-xl flex items-center gap-1 justify-end">
                ★ {movie.rating}
              </span>
              <span className="text-gray-400 text-xs">{movie.releaseDate}</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-4 line-clamp-2 italic leading-relaxed">
            "{movie.overview}"
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
