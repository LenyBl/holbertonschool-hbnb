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

  // Users state
  const [users, setUsers] = useState([]);
  const [userModal, setUserModal] = useState({ open: false, editing: null });
  const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', password: '', is_admin: false });
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [deleteUserModal, setDeleteUserModal] = useState({ open: false, id: null });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isAdmin) { navigate('/places'); return; }
    fetchAll();
  }, [isAdmin, isAuthenticated]);

  const fetchAll = async () => {
    try {
      const [placesRes, amenitiesRes, reviewsRes, usersRes] = await Promise.all([
        api.get('/places'),
        api.get('/amenities'),
        api.get('/reviews'),
        api.get('/users/'),
      ]);
      const amenityList = amenitiesRes.data?.amenities || amenitiesRes.data || [];
      const userList = usersRes.data || [];
      setAmenities(amenityList);
      setUsers(userList);
      setStats({
        places: placesRes.data?.length || 0,
        amenities: amenityList.length,
        reviews: reviewsRes.data?.length || 0,
        users: userList.length,
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
      await api.delete(`/amenities/${deleteModal.id}`);
      toast.success('Équipement supprimé');
      setDeleteModal({ open: false, id: null });
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de suppression');
    }
  };

  // User handlers
  const openCreateUser = () => {
    setUserForm({ first_name: '', last_name: '', email: '', password: '', is_admin: false });
    setUserModal({ open: true, editing: null });
  };
  const openEditUser = (u) => {
    setUserForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, password: '', is_admin: !!u.is_admin });
    setUserModal({ open: true, editing: u });
  };
  const closeUserModal = () => {
    setUserModal({ open: false, editing: null });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserSubmitting(true);
    try {
      if (userModal.editing) {
        const payload = { first_name: userForm.first_name, last_name: userForm.last_name, email: userForm.email, is_admin: userForm.is_admin };
        if (userForm.password) payload.password = userForm.password;
        await api.put(`/users/${userModal.editing.id}`, payload);
        toast.success('Utilisateur mis à jour');
      } else {
        await api.post('/users/', userForm);
        toast.success('Utilisateur créé');
      }
      closeUserModal();
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${deleteUserModal.id}`);
      toast.success('Utilisateur supprimé');
      setDeleteUserModal({ open: false, id: null });
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de suppression');
    }
  };

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Logements', value: stats.places, icon: '🏠', color: 'from-rose-400 to-pink-500' },
    { label: 'Équipements', value: stats.amenities, icon: '✨', color: 'from-violet-400 to-purple-500' },
    { label: 'Avis', value: stats.reviews, icon: '⭐', color: 'from-amber-400 to-orange-500' },
    { label: 'Utilisateurs', value: stats.users, icon: '👤', color: 'from-emerald-400 to-teal-500' },
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
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setActiveTab(2)} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Gérer les utilisateurs</p>
                    <p className="text-xs text-gray-500">{stats.users} utilisateur(s)</p>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Utilisateurs ({users.length})</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateUser}
                className="px-5 py-2.5 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm"
              >
                + Ajouter
              </motion.button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-gray-500 text-sm">Aucun utilisateur.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {users.map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-linear-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                            {u.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {u.first_name} {u.last_name}
                              {u.is_admin && <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditUser(u)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => setDeleteUserModal({ open: true, id: u.id })}
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

      {/* Delete amenity confirm modal */}
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

      {/* User Modal */}
      <Modal
        isOpen={userModal.open}
        onClose={closeUserModal}
        title={userModal.editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      >
        <form onSubmit={handleUserSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={userForm.first_name}
                onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })}
                required
                placeholder="Jean"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={userForm.last_name}
                onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })}
                required
                placeholder="Dupont"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
              placeholder="jean@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe {!userModal.editing && <span className="text-rose-500">*</span>}
              {userModal.editing && <span className="text-gray-400 font-normal">(laisser vide pour ne pas changer)</span>}
            </label>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required={!userModal.editing}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={userForm.is_admin}
              onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
              className="w-4 h-4 rounded accent-rose-500"
            />
            <span className="text-sm font-medium text-gray-700">Administrateur</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeUserModal} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={userSubmitting}
              className="flex-1 py-3 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {userSubmitting ? <><LoadingSpinner size="sm" /> Enregistrement...</> : (userModal.editing ? 'Mettre à jour' : 'Créer')}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete user confirm modal */}
      <Modal isOpen={deleteUserModal.open} onClose={() => setDeleteUserModal({ open: false, id: null })} title="Supprimer l'utilisateur">
        <p className="text-gray-600 text-sm mb-6">Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteUserModal({ open: false, id: null })} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button onClick={handleDeleteUser} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors">
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
