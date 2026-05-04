import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import SwipeCard from './SwipeCard';
import MovieDetail from './MovieDetail';
import FilterModal, { FilterSettings } from './FilterModal';
import { Movie, MovieStatus } from '../types';
import { movieService } from '../services/movieService';
import { Loader2, RefreshCw, Info, RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SwipeView: React.FC = () => {
  const { showToast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  
  const [onlySubscribed, setOnlySubscribed] = useState(() => {
    return localStorage.getItem('only_subscribed') === 'true';
  });
  const [userSubs, setUserSubs] = useState<string[]>([]);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(() => {
    const saved = localStorage.getItem('movie_filters');
    if (saved) return JSON.parse(saved);
    return {
      genres: [],
      platforms: [],
      minRating: 0,
      yearRange: [1900, 2026],
      excludeWatched: true
    };
  });

  // Save filters when they change
  useEffect(() => {
    localStorage.setItem('movie_filters', JSON.stringify(filterSettings));
  }, [filterSettings]);

  useEffect(() => {
    localStorage.setItem('only_subscribed', onlySubscribed.toString());
  }, [onlySubscribed]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const dragProgress = useTransform([x, y], ([latestX, latestY]) => {
    const absX = Math.abs(latestX as number);
    const absY = Math.abs(latestY as number);
    return Math.min(Math.max(absX, absY) / 150, 1);
  });

  const bgScale = useTransform(dragProgress, [0, 1], [0.97, 1]);
  const bgOpacity = useTransform(dragProgress, [0, 1], [0.4, 0.8]);
  const bgY = useTransform(dragProgress, [0, 1], [12, 0]);

  const bg2Scale = useTransform(dragProgress, [0, 1], [0.94, 0.97]);
  const bg2Opacity = useTransform(dragProgress, [0, 1], [0.2, 0.4]);
  const bg2Y = useTransform(dragProgress, [0, 1], [24, 12]);

  // Dynamic Background Glow
  const backgroundGlow = useTransform(
    [x, y],
    ([latestX, latestY]: any) => {
      if (Math.abs(latestX) > Math.abs(latestY)) {
        if (latestX > 50) return `radial-gradient(circle at 80% 50%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)`;
        if (latestX < -50) return `radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 70%)`;
      } else {
        if (latestY > 50) return `radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 70%)`;
        if (latestY < -50) return `radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`;
      }
      return 'none';
    }
  );

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const results = await movieService.getRecommendations("popular exciting varied movies with trivia and frames");
      setMovies(results);
      setCurrentIndex(0);
      setSwipeHistory([]);
    } catch (error: any) {
      showToast(error.message || "Si è verificato un errore durante il caricamento dei film.", "error");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    const loadSubs = () => {
      const subs = localStorage.getItem('user_subscriptions');
      if (subs) setUserSubs(JSON.parse(subs));
    };
    loadSubs();

    window.addEventListener('storage', loadSubs);
    const interval = setInterval(loadSubs, 2000); 

    return () => {
      window.removeEventListener('storage', loadSubs);
      clearInterval(interval);
    };
  }, []);

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach(m => m.genres?.forEach(g => genres.add(g)));
    return Array.from(genres).sort();
  }, [movies]);

  const filteredMovies = useMemo(() => {
    // Get interacted movie IDs from localStorage
    const interactions = JSON.parse(localStorage.getItem('movie_interactions') || '[]');
    const watchedIds = new Set(interactions.map((i: any) => i.movieId));

    return movies.filter(m => {
      // Exclude Watched filter
      if (filterSettings.excludeWatched && watchedIds.has(m.id)) return false;

      // Global Subscription filter
      if (onlySubscribed && !m.availableOn?.some(p => userSubs.includes(p))) return false;
      
      // Filter Modal Platforms
      if (filterSettings.platforms.length > 0 && !m.availableOn?.some(p => filterSettings.platforms.includes(p))) return false;

      // Genre filter
      if (filterSettings.genres.length > 0 && !m.genres?.some(g => filterSettings.genres.includes(g))) return false;
      
      // Year filter
      const yearStr = m.releaseDate?.toString() || "";
      const year = parseInt(yearStr.split('-')[0]);
      if (!isNaN(year) && (year < filterSettings.yearRange[0] || year > filterSettings.yearRange[1])) return false;
      
      // Rating filter
      const rating = parseFloat(m.imdbRating || "0");
      if (rating < filterSettings.minRating) return false;

      return true;
    });
  }, [movies, onlySubscribed, userSubs, filterSettings]);

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    const movie = filteredMovies[currentIndex];
    let status: MovieStatus;

    setLastDirection(direction);
    x.set(0);
    y.set(0);

    switch (direction) {
      case 'right': status = 'watchlist'; break;
      case 'left': status = 'ignored'; break;
      case 'up': status = 'watched-liked'; break;
      case 'down': status = 'watched-disliked'; break;
    }

    console.log(`Swiped ${direction} on ${movie.title} - Status: ${status}`);
    setSwipeHistory(prev => [...prev, currentIndex]);
    setCurrentIndex(prev => prev + 1);
  };

  const undoLastSwipe = () => {
    if (swipeHistory.length === 0) return;
    const previousIndex = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory(prev => prev.slice(0, -1));
    setLastDirection(null);
    setCurrentIndex(previousIndex);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-gray-400 font-medium animate-pulse">Il Direttore sta scegliendo per te...</p>
      </div>
    );
  }

  const hasActiveFilters = onlySubscribed || 
    filterSettings.genres.length > 0 || 
    filterSettings.platforms.length > 0 ||
    filterSettings.minRating > 0 || 
    filterSettings.yearRange[0] > 1900 || 
    filterSettings.yearRange[1] < 2026 ||
    !filterSettings.excludeWatched;

  if (currentIndex >= filteredMovies.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center text-white">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
          {hasActiveFilters ? <Filter size={32} className="text-indigo-500" /> : <RefreshCw size={32} className="text-indigo-500" />}
        </div>
        <div>
          <h3 className="text-2xl font-bold">
            {hasActiveFilters ? "Nessun match con questi filtri" : "Film esauriti!"}
          </h3>
          <p className="text-gray-400 mt-2">
            {hasActiveFilters 
              ? "Prova a allentare i filtri o a resettarli per vedere altri titoli." 
              : "Vuoi che l'AI cerchi altri titoli?"}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {hasActiveFilters && (
            <button 
              onClick={() => {
                setOnlySubscribed(false);
                setFilterSettings({ genres: [], platforms: [], minRating: 0, yearRange: [1900, 2026], excludeWatched: true });
              }}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold transition-all"
            >
              Reset Filtri
            </button>
          )}
          <button 
            onClick={fetchMovies}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
          >
            Cerca nuovi film
          </button>
          {swipeHistory.length > 0 && (
            <button 
              onClick={undoLastSwipe}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Torna all'ultimo Film
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentMovie = filteredMovies[currentIndex];

  return (
    <div className="flex-1 relative mt-4 overflow-visible">
      {/* Dynamic Glow Layer */}
      <motion.div 
        style={{ background: backgroundGlow }}
        className="fixed inset-0 pointer-events-none -z-20 transition-all duration-300"
      />

      {/* Filter Toolbar */}
      <div className="absolute -top-12 left-0 right-0 z-40 flex justify-between items-center px-1">
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
          <button 
            onClick={() => setOnlySubscribed(!onlySubscribed)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${onlySubscribed ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-400'}`}
          >
            <Filter size={12} /> {onlySubscribed ? 'Solo i miei' : 'Streaming'}
          </button>
        </div>

        <button 
          onClick={() => setShowFilters(true)}
          className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 ${filterSettings.genres.length > 0 || filterSettings.platforms.length > 0 || filterSettings.minRating > 0 || !filterSettings.excludeWatched ? 'text-indigo-400 border-indigo-400/50' : 'text-gray-400'}`}
        >
          <SlidersHorizontal size={12} /> 
          Filtri {(filterSettings.genres.length > 0 || filterSettings.platforms.length > 0 || filterSettings.minRating > 0 || !filterSettings.excludeWatched) && '•'}
        </button>
      </div>

      <AnimatePresence mode='popLayout'>
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ 
            x: lastDirection === 'left' ? -500 : lastDirection === 'right' ? 500 : 0,
            y: lastDirection === 'up' ? -500 : lastDirection === 'down' ? 500 : 0,
            opacity: 0,
            rotate: lastDirection === 'left' ? -20 : lastDirection === 'right' ? 20 : 0,
            scale: 1.1
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0"
        >
          <SwipeCard 
            movie={currentMovie} 
            active={true}
            onSwipe={handleSwipe}
            dragX={x}
            dragY={y}
          />
          
          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 z-40 flex flex-col gap-3">
            <button
              onClick={() => setShowDetail(true)}
              className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-black/60 transition-colors shadow-lg"
            >
              <Info size={20} className="text-indigo-400" />
            </button>
            
            {swipeHistory.length > 0 && (
              <button
                onClick={undoLastSwipe}
                className="p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-black/60 transition-colors shadow-lg"
              >
                <RotateCcw size={20} className="text-amber-400" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showDetail && (
          <MovieDetail 
            movie={currentMovie} 
            onClose={() => setShowDetail(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <FilterModal
            settings={filterSettings}
            availableGenres={availableGenres}
            onApply={setFilterSettings}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Background hint cards (Visual depth) */}
      {currentIndex + 1 < filteredMovies.length && (
        <motion.div 
          style={{ scale: bgScale, opacity: bgOpacity, y: bgY }}
          className="absolute inset-0 -z-10 select-none pointer-events-none"
        >
          <div className="w-full h-[600px] bg-white/5 rounded-3xl border border-white/10 shadow-lg" />
        </motion.div>
      )}
      {currentIndex + 2 < filteredMovies.length && (
        <motion.div 
          style={{ 
            scale: bg2Scale, 
            opacity: bg2Opacity, 
            y: bg2Y 
          }}
          className="absolute inset-x-4 inset-y-0 -z-20 select-none pointer-events-none"
        >
          <div className="w-full h-[600px] bg-white/5 rounded-3xl border border-white/10" />
        </motion.div>
      )}
    </div>
  );
};

export default SwipeView;

