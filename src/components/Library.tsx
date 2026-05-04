import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Clock, ThumbsDown, Trash2, ListMusic, Plus, FolderPlus, X } from 'lucide-react';
import { UserInteraction, MovieList } from '../types';
import LazyImage from './ui/LazyImage';

const Library: React.FC = () => {
  const [filter, setFilter] = useState<'watchlist' | 'watched-liked' | 'watched-disliked' | 'lists'>('watchlist');
  
  // Mock data for now
  const [items, setItems] = useState<UserInteraction[]>([]);
  const [lists, setLists] = useState<MovieList[]>([]);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const filteredItems = items.filter(i => i.status === filter);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList: MovieList = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'user1',
      name: newListName,
      movieIds: [],
      createdAt: new Date()
    };
    setLists([...lists, newList]);
    setNewListName('');
    setShowNewListModal(false);
  };

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-hidden relative">
      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 overflow-x-auto no-scrollbar gap-1">
        <button 
          onClick={() => setFilter('watchlist')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'watchlist' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Clock size={14} /> Watchlist
        </button>
        <button 
          onClick={() => setFilter('watched-liked')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'watched-liked' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Heart size={14} /> Like
        </button>
        <button 
          onClick={() => setFilter('watched-disliked')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'watched-disliked' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <ThumbsDown size={14} /> No
        </button>
        <button 
          onClick={() => setFilter('lists')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${filter === 'lists' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <ListMusic size={14} /> Liste
        </button>
      </div>

      {/* Content */}
      {filter === 'lists' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">I tuoi cataloghi</h3>
            <button 
              onClick={() => setShowNewListModal(true)}
              className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase"
            >
              <FolderPlus size={14} /> Nuova Lista
            </button>
          </div>

          {lists.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-10">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-600">
                <ListMusic size={24} />
              </div>
              <p className="text-xs text-gray-500 italic">Crea la tua prima lista personalizzata.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-10 pr-1 scrollbar-hide">
              {lists.map(list => (
                <div key={list.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{list.name}</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black mt-1 tracking-widest">
                      {list.movieIds.length} FILM
                    </p>
                  </div>
                  <button className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} className="text-gray-600 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Original Grid */
        filteredItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Trash2 size={24} className="text-gray-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-200 uppercase tracking-widest text-sm">Ancora nulla qui</h4>
              <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">
                Inizia a fare swipe per popolare la tua biblioteca cinematografica personale.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pb-10 pr-1 scrollbar-hide">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                key={item.id || idx} 
                className="relative aspect-[2/3] rounded-2xl overflow-hidden group border border-white/10"
              >
                <LazyImage src={item.posterPath} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-bold truncate leading-tight">{item.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* New List Modal */}
      <AnimatePresence>
        {showNewListModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#151516] border border-white/10 w-full max-w-xs rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm uppercase tracking-widest">Crea Lista</h3>
                <button onClick={() => setShowNewListModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <input 
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                placeholder="Nome della lista..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors mb-4"
              />
              <button 
                onClick={handleCreateList}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20"
              >
                Crea catalogo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
