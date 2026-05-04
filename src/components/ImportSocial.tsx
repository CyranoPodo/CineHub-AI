import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Image, Search, Loader2, Plus, Check } from 'lucide-react';
import { movieService } from '../services/movieService';
import { Movie } from '../types';
import { useToast } from '../context/ToastContext';
import LazyImage from './ui/LazyImage';

const ImportSocial: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const handleImport = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    showToast("Scansione social in corso...", "info");
    try {
      const movies = await movieService.parseSocialImport(input);
      setResults(movies);
      if (movies.length > 0) {
        showToast(`Importati ${movies.length} titoli con successo!`, "success");
      } else {
        showToast("Nessun titolo trovato nel testo fornito.", "info");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Errore durante l'importazione.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAdd = (id: string, title: string) => {
    setAddedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`${title} rimosso`, "info");
      } else {
        next.add(id);
        showToast(`${title} aggiunto alla raccolta`, "success");
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden">
      <div className="bg-white/5 border border-white/10 p-5 rounded-3xl mb-6">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Link2 size={20} className="text-indigo-400" /> Importa dai Social
        </h3>
        <p className="text-xs text-gray-400 mb-4 italic">
          Incolla un link di Letterboxd, un elenco di TikTok o descrivi un post che hai visto. L'AI estrarrà i titoli per te.
        </p>
        
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text" 
            placeholder="es: 'Ho visto un TikTok con: Inception, Tenet, Oppenheiser'"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button 
            onClick={handleImport}
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Risultati AI</h4>
          <div className="flex-1 overflow-y-auto space-y-3 pb-8 scrollbar-hide">
            <AnimatePresence>
              {results.map((movie) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={movie.id}
                  className="flex bg-white/5 border border-white/10 rounded-2xl p-3 gap-3 hover:bg-white/10 transition-colors group"
                >
                  <LazyImage src={movie.posterPath} alt={movie.title} className="w-16 h-20 object-cover rounded-lg shadow-md" />
                  <div className="flex-1 flex flex-col justify-center">
                    <h5 className="font-bold text-sm leading-tight">{movie.title}</h5>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic leading-tight">"{movie.overview}"</p>
                  </div>
                  <button 
                    onClick={() => toggleAdd(movie.id, movie.title)}
                    className={`p-3 self-center rounded-xl transition-all ${addedIds.has(movie.id) ? 'bg-green-500 text-white' : 'bg-white/5 group-hover:bg-white/20 text-indigo-400'}`}
                  >
                    {addedIds.has(movie.id) ? <Check size={18} /> : <Plus size={18} />}
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

export default ImportSocial;
