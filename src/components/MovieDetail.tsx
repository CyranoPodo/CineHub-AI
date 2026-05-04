import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Info, Image as ImageIcon, PlusCircle, Check } from 'lucide-react';
import { Movie } from '../types';
import LazyImage from './ui/LazyImage';

interface MovieDetailProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movie, onClose }) => {
  const [addedToList, setAddedToList] = useState<string | null>(null);

  // Mock lists
  const myLists = ["Preferiti d'Autore", "Serata Popcorn", "Mind-bending"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="p-6 pb-20 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-black/50 py-4 backdrop-blur-md z-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Dettagli Film</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Poster & Basic Info */}
        <div className="flex gap-6 mb-8">
          <LazyImage 
            src={movie.posterPath} 
            alt={movie.title} 
            className="w-32 h-48 object-cover rounded-2xl shadow-2xl border border-white/10" 
          />
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-black leading-tight mb-2">{movie.title}</h1>
            <div className="flex gap-4 mb-4">
              {movie.matchScore && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Match AI</span>
                  <span className="text-indigo-400 font-black text-lg">{movie.matchScore}%</span>
                </div>
              )}
              {movie.imdbRating && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">IMDb</span>
                  <span className="text-amber-400 font-black text-lg">{movie.imdbRating.split('/')[0]}</span>
                </div>
              )}
              {movie.rottenTomatoes && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rotten</span>
                  <span className="text-red-500 font-black text-lg">{movie.rottenTomatoes}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map(g => (
                <span key={g} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Add to List Section */}
        <section className="mb-10 p-4 bg-white/5 border border-white/10 rounded-3xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <PlusCircle size={14} className="text-indigo-400" /> Aggiungi a una lista
          </h3>
          <div className="flex flex-wrap gap-2">
            {myLists.map(list => (
              <button 
                key={list}
                onClick={() => setAddedToList(list)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${addedToList === list ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}
              >
                {addedToList === list ? <Check size={12} /> : <PlusCircle size={12} />}
                {list}
              </button>
            ))}
          </div>
        </section>

        {/* Availability Section */}
        {movie.availableOn && movie.availableOn.length > 0 && (
          <section className="mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
              <ImageIcon size={14} className="text-pink-400" /> Disponibile su
            </h3>
            <div className="flex flex-wrap gap-2">
              {movie.availableOn.map(platform => (
                <div key={platform} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-300">
                  {platform}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Synopsis */}
        <section className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
            <Info size={14} /> Sinossi
          </h3>
          <p className="text-gray-300 leading-relaxed italic">
            "{movie.overview}"
          </p>
        </section>

        {/* Memory Triggers (Frames) */}
        <section className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
            <ImageIcon size={14} /> Frame Iconici (Ti ricordano qualcosa?)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {movie.frames?.map((frame, i) => (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                key={i} 
                className="aspect-video rounded-xl overflow-hidden border border-white/5"
              >
                <LazyImage 
                  src={frame} 
                  alt="Film frame" 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trivia */}
        <section className="mb-10">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
            <Trophy size={14} /> Curiosità Verificate
          </h3>
          <ul className="space-y-4">
            {movie.trivia?.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300 bg-white/5 p-4 rounded-2xl border border-white/10">
                <span className="text-indigo-400 font-black">0{i+1}.</span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer info */}
        <footer className="pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">
            Powered by CineHUB AI Director
          </p>
        </footer>
      </div>
    </motion.div>
  );
};

export default MovieDetail;
