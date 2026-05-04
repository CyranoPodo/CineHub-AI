import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl
                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
                ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}
                ${toast.type === 'info' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : ''}
              `}>
                {toast.type === 'success' && <CheckCircle size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Info size={18} />}
                
                <p className="text-xs font-bold flex-1">{toast.message}</p>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={14} className="opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
