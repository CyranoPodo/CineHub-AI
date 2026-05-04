import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, Film, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Movie } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AIConcierge: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Ciao! Sono il tuo Direttore AI. Che tipo di film ti andrebbe di vedere oggi? Parlami del tuo mood, generi preferiti o attori che adori.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Tu sei un esperto Direttore Cinematografico. Aiuta l'utente a trovare il film perfetto. 
        Analizza la sua richiesta: "${input}". 
        Se l'utente chiede consigli, fornisci una risposta testuale calda e professionale seguita da una lista di massimo 3 film in formato discorsivo.
        Esempio: "Ottima scelta! Se ti piace lo stile di Nolan, ti consiglio sicuramente..."`,
      });

      const modelMessage: ChatMessage = { 
        role: 'model', 
        content: response.text || "Ops, ho avuto un blackout creativo. Riprova!", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-4 max-h-[calc(100vh-180px)]">
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800 border border-white/10'}`}>
                  {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-indigo-400" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3 items-center text-gray-400">
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                </div>
                <span className="text-xs italic">Il Direttore sta riflettendo...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-3xl mt-2 backdrop-blur-sm mb-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Scrivi al Direttore..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none h-10 scrollbar-hide"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-800 rounded-2xl transition-all self-end"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConcierge;
