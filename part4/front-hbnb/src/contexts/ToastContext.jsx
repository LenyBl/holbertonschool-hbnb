import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

const STYLES = {
  success: { bg: 'bg-white', bar: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600', title: 'text-emerald-700', text: 'text-gray-600' },
  error:   { bg: 'bg-white', bar: 'bg-rose-500',    icon: 'bg-rose-100 text-rose-600',       title: 'text-rose-700',    text: 'text-gray-600' },
  info:    { bg: 'bg-white', bar: 'bg-indigo-500',  icon: 'bg-indigo-100 text-indigo-600',   title: 'text-indigo-700',  text: 'text-gray-600' },
  warning: { bg: 'bg-white', bar: 'bg-amber-500',   icon: 'bg-amber-100 text-amber-600',     title: 'text-amber-700',   text: 'text-gray-600' },
};

const TITLES = { success: 'Succès', error: 'Erreur', info: 'Information', warning: 'Attention' };

function ToastItem({ toast, onRemove }) {
  const s = STYLES[toast.type] || STYLES.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative flex items-start gap-3 w-80 ${s.bg} rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-4 cursor-pointer group`}
      onClick={() => onRemove(toast.id)}
    >
      {/* Side bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />

      {/* Icon */}
      <div className={`shrink-0 w-9 h-9 rounded-xl ${s.icon} flex items-center justify-center ml-1`}>
        {ICONS[toast.type]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-bold ${s.title}`}>{TITLES[toast.type]}</p>
        <p className={`text-sm mt-0.5 leading-snug ${s.text}`}>{toast.message}</p>
      </div>

      {/* Close button */}
      <button className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100 -mt-0.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        initial={{ scaleX: 1, transformOrigin: 'left' }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${s.bar} opacity-30`}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (m) => addToast(m, 'success'),
    error:   (m) => addToast(m, 'error'),
    info:    (m) => addToast(m, 'info'),
    warning: (m) => addToast(m, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
