import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Globe, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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

interface StreamingSettingsProps {
  onClose: () => void;
}

const StreamingSettings: React.FC<StreamingSettingsProps> = ({ onClose }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('user_subscriptions');
    if (saved) {
      setSelected(JSON.parse(saved));
    }
  }, []);

  const togglePlatform = (platform: string) => {
    setSelected(prev => {
      const next = prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform];
      
      localStorage.setItem('user_subscriptions', JSON.stringify(next));
      return next;
    });
  };

  const handleSave = () => {
    showToast("Preferenze streaming aggiornate!", "success");
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col p-6"
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">I tuoi abbonamenti</h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">Filtra i consigli in base a ciò che puoi guardare</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-3">
        {PLATFORMS.map(platform => {
          const isSelected = selected.includes(platform);
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`
                relative p-4 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 text-center
                ${isSelected 
                  ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}
              `}
            >
              <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                {platform === "Netflix" && <div className="w-6 h-6 flex items-center justify-center font-black text-red-500">N</div>}
                {platform === "Disney+" && <div className="w-6 h-6 flex items-center justify-center font-black text-blue-400">D+</div>}
                {platform !== "Netflix" && platform !== "Disney+" && <Globe size={18} />}
              </div>
              <span className="text-xs font-bold">{platform}</span>
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <Check size={12} className="text-indigo-600" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-8">
        <button 
          onClick={handleSave}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
        >
          Salva configurazione
        </button>
      </div>
    </motion.div>
  );
};

export default StreamingSettings;
