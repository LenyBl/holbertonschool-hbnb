import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function getGradient(id = '') {
  const gradients = [
    'from-rose-400 to-orange-400',
    'from-violet-500 to-purple-600',
    'from-sky-400 to-blue-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-indigo-400 to-blue-500',
    'from-cyan-400 to-sky-500',
  ];
  const index = id.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export default function PlaceCard({ place, index = 0 }) {
  const { id, title, description, price, amenities = [] } = place;
  const gradient = getGradient(id);
  const imageUrl = `https://picsum.photos/seed/${id}/400/280`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group"
    >
      <Link to={`/places/${id}`}>
        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} items-center justify-center hidden`}
          >
            <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-white/95 backdrop-blur-sm text-gray-900 text-sm font-bold px-3 py-1 rounded-full shadow-md">
              {price}€<span className="text-gray-500 font-normal text-xs">/nuit</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 group-hover:text-rose-500 transition-colors line-clamp-1">
            {title}
          </h3>
          {description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
              {description}
            </p>
          )}
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {amenities.slice(0, 3).map((a) => (
                <span
                  key={a.id}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                >
                  {a.name}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  +{amenities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
