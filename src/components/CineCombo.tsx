import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Search, Loader2, Plus, Sparkles, Check, Trash2 } from 'lucide-react';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import { useToast } from '../context/ToastContext';
import LazyImage from './ui/LazyImage';

const CineCombo: React.FC = () => {
  const [titles, setTitles] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const handleAddField = () => {
    if (titles.length < 4) {
      setTitles([...titles, '']);
    }
  };

  const handleRemoveField = (index: number) => {
    if (titles.length > 2) {
      const next = [...titles];
      next.splice(index, 1);
      setTitles(next);
    }
  };

  const handleUpdateField = (index: number, val: string) => {
    const next = [...titles];
    next[index] = val;
    setTitles(next);
  };

  const handleAnalyze = async () => {
    const validTitles = titles.filter(t => t.trim() !== '');
    if (validTitles.length < 2 || loading) return;

    setLoading(true);
    setResults([]);
    showToast("Analisi DNA in corso...", "info");
    try {
      const movies = await movieService.getComboRecommendations(validTitles);
      setResults(movies);
      if (movies.length > 0) {
        showToast(`Trovati ${movies.length} film compatibili!`, "success");
      } else {
        showToast("Nessun match perfetto trovato.", "info");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Errore durante l'analisi.", "error");
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
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-6 shadow-xl">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Layers size={20} className="text-indigo-400" /> CineCombo DNA
        </h3>
        <p className="text-xs text-gray-400 mb-4 italic leading-relaxed">
          Inserisci 2, 3 o 4 film che ami. L'AI analizzerà i tratti comuni per consigliarti nuovi titoli con lo stesso "mood".
        </p>
        
        <div className="space-y-3 mb-4">
          {titles.map((title, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                value={title}
                onChange={(e) => handleUpdateField(idx, e.target.value)}
                type="text" 
                placeholder={`Titolo film #${idx + 1}`}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {titles.length > 2 && (
                <button 
                  onClick={() => handleRemoveField(idx)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {titles.length < 4 && (
            <button 
              onClick={handleAddField}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Aggiungi Film
            </button>
          )}
          <button 
            onClick={handleAnalyze}
            disabled={loading || titles.filter(t => t.trim() !== '').length < 2}
            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Analizza Combo
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles size={14} /> Suggerimenti Affini
          </h4>
          <div className="flex-1 overflow-y-auto space-y-4 pb-8 scrollbar-hide">
            <AnimatePresence>
              {results.map((movie) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={movie.id}
                  className="flex bg-white/5 border border-white/10 rounded-2xl p-4 gap-4 hover:bg-white/10 transition-all group"
                >
                  <div className="relative">
                    <LazyImage src={movie.posterPath} alt={movie.title} className="w-20 h-28 object-cover rounded-xl shadow-lg border border-white/5" />
                    {movie.matchScore && (
                      <div className="absolute -top-2 -left-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white/20">
                        {movie.matchScore}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h5 className="font-bold text-sm leading-tight mb-1">{movie.title}</h5>
                    <div className="flex gap-2 mb-2">
                       {movie.imdbRating && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">IMDB {movie.imdbRating.split('/')[0]}</span>
                       )}
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 italic leading-relaxed">"{movie.overview}"</p>
                  </div>
                  <button 
                    onClick={() => toggleAdd(movie.id)}
                    className={`h-12 w-12 self-center rounded-2xl transition-all flex items-center justify-center ${addedIds.has(movie.id) ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 group-hover:bg-indigo-500/10 text-indigo-400 border border-white/5'}`}
                  >
                    {addedIds.has(movie.id) ? <Check size={20} /> : <Plus size={20} />}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default CineCombo;
