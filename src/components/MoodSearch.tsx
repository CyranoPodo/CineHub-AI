import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Frown, Compass, Coffee, Zap, Moon, Search, Loader2, Sparkles, Check, Plus } from 'lucide-react';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import { useToast } from '../context/ToastContext';
import LazyImage from './ui/LazyImage';

const PREDEFINED_MOODS = [
  { id: 'happy', label: 'Felice', icon: <Smile className="text-yellow-400" />, prompt: 'happy, uplifting, feel-good, comedy' },
  { id: 'sad', label: 'Malonconico', icon: <Frown className="text-blue-400" />, prompt: 'sad, emotional, drama, melancholic, tear-jerker' },
  { id: 'adventurous', label: 'Avventuroso', icon: <Compass className="text-green-400" />, prompt: 'adventurous, action, exploration, exciting' },
  { id: 'relaxed', label: 'Rilassato', icon: <Coffee className="text-amber-600" />, prompt: 'relaxed, cozy, slow-paced, peaceful' },
  { id: 'energetic', label: 'Energico', icon: <Zap className="text-purple-400" />, prompt: 'energetic, fast-paced, high-octane, thriller' },
  { id: 'mysterious', label: 'Misterioso', icon: <Moon className="text-indigo-400" />, prompt: 'mysterious, noir, mystery, mind-bending' },
];

const MoodSearch: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customMood, setCustomMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const handleMoodSelect = async (moodId: string, prompt: string) => {
    setSelectedMood(moodId);
    setCustomMood('');
    await fetchMoodMovies(prompt);
  };

  const handleCustomSearch = async () => {
    if (!customMood.trim()) return;
    setSelectedMood(null);
    await fetchMoodMovies(customMood);
  };

  const fetchMoodMovies = async (mood: string) => {
    if (loading) return;
    setLoading(true);
    setResults([]);
    try {
      const movies = await movieService.getMoviesByMood(mood);
      setResults(movies);
      if (movies.length === 0) {
        showToast("Nessun film trovato per questo mood.", "info");
      }
    } catch (error: any) {
      showToast(error.message || "Errore nella ricerca per mood.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdd = (id: string) => {
    setAddedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Rimosso dalla selezione", "info");
      } else {
        next.add(id);
        showToast("Aggiunto alla selezione", "success");
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden">
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-6 shadow-xl backdrop-blur-md">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Sparkles size={20} className="text-indigo-400" /> Ricerca per Mood
        </h3>
        <p className="text-xs text-gray-400 mb-6 italic leading-relaxed">
          Come ti senti oggi? Scegli un mood o descrivi la tua emozione per ricevere consigli su misura.
        </p>
        
        {/* Predefined Moods Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {PREDEFINED_MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMoodSelect(m.id, m.prompt)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 ${
                selectedMood === m.id 
                  ? 'bg-indigo-500/20 border-indigo-500/50 scale-105 shadow-lg shadow-indigo-500/10' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="p-2 bg-black/20 rounded-xl">
                {m.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedMood === m.id ? 'text-indigo-400' : 'text-gray-400'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Mood Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
              type="text" 
              placeholder="Oppure descrivi come ti senti..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors pl-10"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button 
            onClick={handleCustomSearch}
            disabled={loading || !customMood.trim()}
            className="p-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12"
            >
              <Loader2 size={40} className="animate-spin text-indigo-500 mb-4 opacity-50" />
              <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">Analizzando l'atmosfera...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 px-1">
                <Sparkles size={12} /> Film per il tuo mood
              </h4>
              <div className="flex-1 overflow-y-auto space-y-4 pb-8 scrollbar-hide px-1">
                {results.map((movie) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={movie.id}
                    className="flex bg-white/5 border border-white/10 rounded-3xl p-4 gap-4 hover:bg-white/10 transition-all group overflow-hidden relative"
                  >
                    <div className="relative z-10">
                      <LazyImage src={movie.posterPath} alt={movie.title} className="w-20 h-28 object-cover rounded-2xl shadow-xl border border-white/5" />
                      {movie.matchScore && (
                        <div className="absolute -top-1 -left-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white/10">
                          {movie.matchScore}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center z-10">
                      <h5 className="font-bold text-sm leading-tight mb-1 text-white pr-8">{movie.title}</h5>
                      <div className="flex gap-2 mb-2">
                         {movie.imdbRating && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase">IMDB {movie.imdbRating.split('/')[0]}</span>
                         )}
                         {movie.genres?.[0] && (
                           <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 font-bold uppercase">{movie.genres[0]}</span>
                         )}
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-2 italic leading-relaxed">"{movie.overview}"</p>
                    </div>
                    <button 
                      onClick={() => toggleAdd(movie.id)}
                      className={`h-12 w-12 self-center rounded-2xl transition-all flex items-center justify-center z-10 shrink-0 ${
                        addedIds.has(movie.id) 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                          : 'bg-white/5 group-hover:bg-indigo-500/10 text-indigo-400 border border-white/5'
                      }`}
                    >
                      {addedIds.has(movie.id) ? <Check size={20} /> : <Plus size={20} />}
                    </button>

                    {/* Subtle background glow based on mood */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] -z-0 rounded-full translate-x-10 -translate-y-10" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : !selectedMood && !customMood ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Sparkles size={32} className="text-indigo-400/30" />
              </div>
              <h4 className="text-sm font-bold text-gray-300 mb-2">Pronto per un consiglio?</h4>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.1em] max-w-[200px]">Seleziona uno dei mood sopra per iniziare la tua scoperta personalizzata.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MoodSearch;
