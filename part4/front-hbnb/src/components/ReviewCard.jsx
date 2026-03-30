import { motion } from 'framer-motion';
import StarRating from './StarRating';

export default function ReviewCard({ review, index = 0, onDelete, canDelete }) {
  const { text, rating, user_id } = review;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
            {user_id?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Voyageur</p>
            <StarRating value={rating} size="sm" />
          </div>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(review.id)}
            className="text-gray-400 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}
