import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-2 border-rose-200 border-t-rose-500 rounded-full`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-5/6" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-12 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
