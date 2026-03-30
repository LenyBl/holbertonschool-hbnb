import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`transition-all duration-200 rounded-xl overflow-hidden ${
                transparent ? 'bg-white/15 backdrop-blur-sm px-2 py-1' : ''
              }`}
            >
              <img
                src="/logo.png"
                alt="HBnB"
                className="h-8 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Center nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: 'Accueil' },
              { to: '/places', label: 'Logements' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === to
                    ? transparent
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-50 text-rose-600'
                    : transparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/places/new"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  transparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                + Publier
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                    transparent
                      ? 'border-white/30 text-white hover:bg-white/10'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate">{user?.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <span>🛡️</span> Administration
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <span>→</span> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    transparent
                      ? 'bg-white text-rose-600 hover:bg-rose-50'
                      : 'bg-linear-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-200'
                  }`}
                >
                  Connexion
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg ${transparent ? 'text-white' : 'text-gray-700'}`}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }} className={`block h-0.5 w-full rounded transition-colors ${transparent ? 'bg-white' : 'bg-gray-700'}`} />
              <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className={`block h-0.5 w-full rounded transition-colors ${transparent ? 'bg-white' : 'bg-gray-700'}`} />
              <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }} className={`block h-0.5 w-full rounded transition-colors ${transparent ? 'bg-white' : 'bg-gray-700'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              <Link to="/" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Accueil</Link>
              <Link to="/places" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">Logements</Link>
              {isAuthenticated && (
                <>
                  <Link to="/places/new" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">+ Publier un logement</Link>
                  {isAdmin && <Link to="/admin" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">🛡️ Administration</Link>}
                  <button onClick={handleLogout} className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-sm font-medium text-left">Déconnexion</button>
                </>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="px-3 py-2 rounded-lg bg-rose-500 text-white text-sm font-semibold text-center">Connexion</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
