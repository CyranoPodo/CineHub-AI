import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Film, Sparkles, Library, Settings, Search, Layers, Smile } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onOpenSettings }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans flex flex-col items-center overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-md px-6 py-4 flex justify-between items-center z-50 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Film size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">CineHUB AI</h1>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Settings size={20} className="text-gray-400" />
        </button>
      </header>

      {/* Content Area */}
      <main className="flex-1 w-full max-w-md relative px-4 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="w-full max-w-md px-4 py-4 pb-8 bg-gradient-to-t from-black to-transparent flex justify-between items-center z-50 overflow-x-auto no-scrollbar gap-2">
        <NavButton 
          active={activeTab === 'swipe'} 
          onClick={() => onTabChange('swipe')}
          icon={<Film size={20} />}
          label="Swipe"
        />
        <NavButton 
          active={activeTab === 'mood'} 
          onClick={() => onTabChange('mood')}
          icon={<Smile size={20} />}
          label="Mood"
        />
        <NavButton 
          active={activeTab === 'ai'} 
          onClick={() => onTabChange('ai')}
          icon={<Sparkles size={20} />}
          label="Ai Direct"
        />
        <NavButton 
          active={activeTab === 'combo'} 
          onClick={() => onTabChange('combo')}
          icon={<Layers size={20} />}
          label="Combo"
        />
        <NavButton 
          active={activeTab === 'library'} 
          onClick={() => onTabChange('library')}
          icon={<Library size={20} />}
          label="Raccolta"
        />
        <NavButton 
          active={activeTab === 'import'} 
          onClick={() => onTabChange('import')}
          icon={<Search size={20} />}
          label="Importa"
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-400 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
  </button>
);

export default Layout;
