import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import PlaceCard from '../components/PlaceCard';
import { CardSkeleton } from '../components/LoadingSpinner';

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (target / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const categories = [
  { icon: '🏖️', label: 'Plage', color: 'from-cyan-400 to-blue-500' },
  { icon: '🏔️', label: 'Montagne', color: 'from-emerald-400 to-teal-600' },
  { icon: '🏙️', label: 'Ville', color: 'from-violet-400 to-purple-600' },
  { icon: '🌲', label: 'Nature', color: 'from-green-400 to-emerald-600' },
  { icon: '🏡', label: 'Campagne', color: 'from-amber-400 to-orange-500' },
  { icon: '🌊', label: 'Lac', color: 'from-sky-400 to-cyan-600' },
];

const steps = [
  { icon: '🔍', title: 'Explorez', desc: 'Découvrez des milliers de logements uniques à travers le monde' },
  { icon: '📅', title: 'Réservez', desc: 'Choisissez vos dates et confirmez votre séjour en quelques clics' },
  { icon: '✈️', title: 'Voyagez', desc: 'Profitez de votre hébergement et créez des souvenirs inoubliables' },
];

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    api.get('/places').then(({ data }) => setPlaces(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/places?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-rose-950 to-purple-950" />
          {/* Animated orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"
          />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-rose-300 text-sm font-medium px-4 py-2 rounded-full border border-white/10 mb-8">
              <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
              Plus de {loading ? '...' : places.length} logements disponibles
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Trouvez votre
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              séjour idéal
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-white/70 text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Découvrez des hébergements uniques gérés par des hôtes passionnés du monde entier.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            onSubmit={handleSearch}
            className="flex gap-2 max-w-xl mx-auto"
          >
            <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center px-4 gap-3 focus-within:border-white/40 transition-colors">
              <svg className="w-5 h-5 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un logement..."
                className="flex-1 bg-transparent text-white placeholder-white/40 py-4 outline-none text-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-7 py-4 rounded-2xl font-semibold text-sm shadow-xl hover:shadow-rose-500/30 transition-shadow"
            >
              Chercher
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/30 flex flex-col items-center gap-1"
            >
              <span className="text-xs">Défiler</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Logements', value: places.length || 120, suffix: '+' },
              { label: 'Destinations', value: 45, suffix: '' },
              { label: 'Hôtes', value: 89, suffix: '' },
              { label: 'Avis positifs', value: 98, suffix: '%' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Explorez par type</h2>
            <p className="text-gray-500 text-lg">Chaque destination, un monde à découvrir</p>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.08, y: -4 }}
                onClick={() => navigate('/places')}
                className="cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${cat.color} rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-xl transition-shadow`}>
                  <span className="text-3xl">{cat.icon}</span>
                </div>
                <p className="text-center text-sm font-medium text-gray-700 mt-2">{cat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured places */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Logements à la une</h2>
              <p className="text-gray-500">Les meilleurs endroits sélectionnés pour vous</p>
            </div>
            <Link to="/places" className="text-rose-500 font-semibold text-sm hover:text-rose-600 transition-colors whitespace-nowrap">
              Voir tout →
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {places.slice(0, 8).map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-rose-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Comment ça fonctionne</h2>
            <p className="text-white/60 text-lg">Simple, rapide et sécurisé</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-3xl mx-auto mb-5">
                  {step.icon}
                </div>
                <div className="flex items-center justify-center mb-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-14"
          >
            <Link to="/places">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-10 py-4 rounded-2xl font-bold text-base shadow-2xl hover:shadow-rose-500/30 transition-shadow"
              >
                Commencer l'aventure
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">H</div>
              <span className="text-white font-bold">HBnB</span>
            </div>
            <p className="text-sm text-center">© 2025 HBnB — Holberton School Project</p>
            <div className="flex gap-4 text-sm">
              <Link to="/places" className="hover:text-white transition-colors">Logements</Link>
              <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
