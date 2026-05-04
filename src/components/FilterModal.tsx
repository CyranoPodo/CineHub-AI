import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Star, Calendar, Clapperboard, Filter } from 'lucide-react';

export interface FilterSettings {
  genres: string[];
  platforms: string[];
  minRating: number;
  yearRange: [number, number];
  excludeWatched: boolean;
}

interface FilterModalProps {
  settings: FilterSettings;
  onApply: (settings: FilterSettings) => void;
  onClose: () => void;
  availableGenres: string[];
}

const PLATFORMS = [
  "Netflix",
  "Disney+",
  "Prime Video",
  "Apple TV+",
  "Now TV",
  "Paramount+",
  "MUBI",
  "Sky",
  "YouTube"
];

const FilterModal: React.FC<FilterModalProps> = ({ settings, onApply, onClose, availableGenres }) => {
  const [localSettings, setLocalSettings] = useState<FilterSettings>(settings);

  const toggleGenre = (genre: string) => {
    setLocalSettings(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const togglePlatform = (platform: string) => {
    setLocalSettings(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleApply = () => {
    onApply(localSettings);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col p-6"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Filter size={24} className="text-indigo-500" />
            Affina la ricerca
          </h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Configura i tuoi filtri avanzati</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto space-y-10 pr-2">
        {/* Platforms */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <Check size={14} className="text-blue-400" /> Piattaforme Streaming
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map(platform => {
              const isSelected = localSettings.platforms.includes(platform);
              return (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`
                    px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}
                  `}
                >
                  {platform}
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Genres */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <Clapperboard size={14} className="text-pink-400" /> Generi
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map(genre => {
              const isSelected = localSettings.genres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`
                    px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                    ${isSelected 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}
                  `}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </section>

        {/* Rating */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <Star size={14} className="text-yellow-400" /> Voto minimo (IMDb)
          </h3>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.5" 
              value={localSettings.minRating}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-xl font-black text-indigo-400 min-w-[3rem] text-right">{localSettings.minRating}</span>
          </div>
        </section>

        {/* Years */}
        <section>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-green-400" /> Periodo (Anno)
          </h3>
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">DAL</label>
              <input 
                type="number" 
                value={localSettings.yearRange[0]}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, yearRange: [parseInt(e.target.value), prev.yearRange[1]] }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold">AL</label>
              <input 
                type="number" 
                value={localSettings.yearRange[1]}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, yearRange: [prev.yearRange[0], parseInt(e.target.value)] }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Exclude Watched Toggle */}
        <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">Escludi già visti</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nasconde i film che hai già valutato</p>
            </div>
            <button 
              onClick={() => setLocalSettings(prev => ({ ...prev, excludeWatched: !prev.excludeWatched }))}
              className={`w-14 h-8 rounded-full transition-all relative ${localSettings.excludeWatched ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: localSettings.excludeWatched ? 26 : 4 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={() => setLocalSettings({ genres: [], platforms: [], minRating: 0, yearRange: [1900, 2026], excludeWatched: true })}
          className="py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
        >
          Resetta
        </button>
        <button 
          onClick={handleApply}
          className="py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
        >
          Applica Filtri
        </button>
      </div>
    </motion.div>
  );
};

export default FilterModal;
