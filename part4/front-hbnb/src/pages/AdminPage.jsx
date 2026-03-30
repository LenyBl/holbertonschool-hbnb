import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PageLoader, LoadingSpinner } from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const TABS = ['Aperçu', 'Équipements', 'Utilisateurs'];

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ places: 0, users: 0, amenities: 0, reviews: 0 });
  const [amenities, setAmenities] = useState([]);
  const [amenityModal, setAmenityModal] = useState({ open: false, editing: null });
  const [amenityName, setAmenityName] = useState('');
  const [amenitySubmitting, setAmenitySubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/places'); return; }
    fetchAll();
  }, [isAdmin, isAuthenticated]);

  const fetchAll = async () => {
    try {
      const [placesRes, amenitiesRes, reviewsRes] = await Promise.all([
        api.get('/places'),
        api.get('/amenities'),
        api.get('/reviews'),
      ]);
      const amenityList = amenitiesRes.data?.amenities || amenitiesRes.data || [];
      setAmenities(amenityList);
      setStats({
        places: placesRes.data?.length || 0,
        amenities: amenityList.length,
        reviews: reviewsRes.data?.length || 0,
        users: '-',
      });
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const openCreateAmenity = () => {
    setAmenityName('');
    setAmenityModal({ open: true, editing: null });
  };
  const openEditAmenity = (a) => {
    setAmenityName(a.name);
    setAmenityModal({ open: true, editing: a });
  };
  const closeAmenityModal = () => {
    setAmenityModal({ open: false, editing: null });
    setAmenityName('');
  };

  const handleAmenitySubmit = async (e) => {
    e.preventDefault();
    setAmenitySubmitting(true);
    try {
      if (amenityModal.editing) {
        await api.put(`/amenities/${amenityModal.editing.id}`, { name: amenityName });
        toast.success('Équipement mis à jour');
      } else {
        await api.post('/amenities', { name: amenityName });
        toast.success('Équipement créé');
      }
      closeAmenityModal();
      await fetchAll();
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expirée. Reconnectez-vous.');
      } else if (err.response?.status === 403) {
        toast.error('Droits administrateur requis.');
      } else {
        toast.error(err.response?.data?.error || 'Une erreur est survenue.');
      }
    } finally {
      setAmenitySubmitting(false);
    }
  };

  const handleDeleteAmenity = async () => {
    try {
      toast.info('La suppression d\'équipement n\'est pas encore supportée par l\'API');
      setDeleteModal({ open: false, id: null });
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Logements', value: stats.places, icon: '🏠', color: 'from-rose-400 to-pink-500' },
    { label: 'Équipements', value: stats.amenities, icon: '✨', color: 'from-violet-400 to-purple-500' },
    { label: 'Avis', value: stats.reviews, icon: '⭐', color: 'from-amber-400 to-orange-500' },
    { label: 'Statut API', value: '✓ OK', icon: '🔗', color: 'from-emerald-400 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-2xl font-bold">Administration</h1>
            </div>
            <p className="text-gray-400 text-sm">Gérez les équipements et surveillez l'activité de la plateforme.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit mb-8">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-xl mb-3`}>
                    {card.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab(1)} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                  <span className="text-2xl">✨</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Gérer les équipements</p>
                    <p className="text-xs text-gray-500">{stats.amenities} équipement(s)</p>
                  </div>
                </motion.button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => navigate('/places')} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Voir les logements</p>
                    <p className="text-xs text-gray-500">{stats.places} logement(s)</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 1: Amenities */}
        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Équipements ({amenities.length})</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateAmenity}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm"
              >
                + Ajouter
              </motion.button>
            </div>

            {amenities.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">✨</p>
                <p className="text-gray-500 text-sm">Aucun équipement. Créez-en un !</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {amenities.map((a, i) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm">✨</div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{a.name}</p>
                            <p className="text-xs text-gray-400">ID: {a.id?.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditAmenity(a)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: a.id })}
                            className="px-3 py-1.5 text-xs font-medium text-rose-500 hover:text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Users */}
        {activeTab === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
              <p className="text-4xl mb-4">👤</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gestion des utilisateurs</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                La création d'utilisateurs est réservée aux administrateurs. Utilisez l'API directement ou les outils ci-dessous.
              </p>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-left max-w-sm mx-auto">
                <p className="text-amber-700 text-sm font-semibold mb-2">POST /api/v1/users</p>
                <p className="text-amber-600 text-xs">Requiert un token JWT admin dans le header Authorization.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Amenity Modal */}
      <Modal
        isOpen={amenityModal.open}
        onClose={closeAmenityModal}
        title={amenityModal.editing ? 'Modifier l\'équipement' : 'Nouvel équipement'}
      >
        <form onSubmit={handleAmenitySubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom de l'équipement <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={amenityName}
              onChange={(e) => setAmenityName(e.target.value)}
              required
              maxLength={100}
              placeholder="ex: WiFi, Piscine, Parking..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={closeAmenityModal} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={amenitySubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {amenitySubmitting ? <><LoadingSpinner size="sm" /> Enregistrement...</> : (amenityModal.editing ? 'Mettre à jour' : 'Créer')}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, id: null })} title="Confirmer la suppression">
        <p className="text-gray-600 text-sm mb-6">Êtes-vous sûr de vouloir supprimer cet équipement ?</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleDeleteAmenity} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors">
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
