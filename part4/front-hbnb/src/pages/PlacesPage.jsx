import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import PlaceCard from '../components/PlaceCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const SORT_OPTIONS = [
  { value: 'default', label: 'Par défaut' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'title', label: 'Alphabétique' },
];

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const searchQuery = searchParams.get('search') || '';
  const [search, setSearch] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sort, setSort] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/places'),
      api.get('/amenities'),
    ]).then(([placesRes, amenitiesRes]) => {
      setPlaces(placesRes.data);
      setAmenities(amenitiesRes.data?.amenities || amenitiesRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = places
    .filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      if (selectedAmenities.length > 0) {
        const placeAmenityIds = (p.amenities || []).map((a) => a.id);
        if (!selectedAmenities.every((id) => placeAmenityIds.includes(id))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setSort('default');
    setSearchParams({});
  };

  const hasActiveFilters = search || minPrice || maxPrice || selectedAmenities.length > 0 || sort !== 'default';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSearchParams(e.target.value ? { search: e.target.value } : {}); }}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            {/* Filter toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                filterOpen || hasActiveFilters
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">!</span>
              )}
            </motion.button>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Effacer
              </button>
            )}

            {isAuthenticated && (
              <Link to="/places/new" className="ml-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-rose-200 transition-shadow"
                >
                  + Publier
                </motion.button>
              </Link>
            )}
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prix par nuit (€)</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                      <span className="text-gray-400">—</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                      />
                    </div>
                  </div>
                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Équipements</p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => toggleAmenity(a.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selectedAmenities.includes(a.id)
                                ? 'bg-rose-500 border-rose-500 text-white'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-500'
                            }`}
                          >
                            {a.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {loading ? 'Chargement...' : `${filtered.length} logement${filtered.length !== 1 ? 's' : ''}`}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Aucun logement trouvé"
            description="Essayez de modifier vos filtres pour trouver ce que vous cherchez."
            action={isAuthenticated ? { to: '/places/new', label: 'Publier un logement' } : undefined}
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
