import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LoadingSpinner, PageLoader } from '../components/LoadingSpinner';

// Lazy-load the map to avoid SSR issues with Leaflet
const MapPicker = lazy(() => import('../components/MapPicker'));

export default function CreateEditPlacePage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    latitude: '',
    longitude: '',
    amenities: [],
  });

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const fetchAmenities = api.get('/amenities').then(({ data }) => {
      setAmenities(data?.amenities || data || []);
    });
    if (isEdit) {
      Promise.all([fetchAmenities, api.get(`/places/${id}`)]).then(([, placeRes]) => {
        const p = placeRes.data;
        setForm({
          title: p.title || '',
          description: p.description || '',
          price: p.price?.toString() || '',
          latitude: p.latitude?.toString() || '',
          longitude: p.longitude?.toString() || '',
          amenities: (p.amenities || []).map((a) => a.id),
        });
        setLoading(false);
      }).catch(() => { toast.error('Erreur de chargement'); navigate('/places'); });
    } else {
      fetchAmenities.catch(() => {}).finally(() => setLoading(false));
    }
  }, [id, isEdit, isAuthenticated]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMapSelect = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  };

  const toggleAmenity = (amenityId) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((x) => x !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) {
      toast.error('Veuillez sélectionner une position sur la carte.');
      return;
    }
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      amenities: form.amenities,
    };
    try {
      if (isEdit) {
        await api.put(`/places/${id}`, payload);
        toast.success('Logement mis à jour !');
        navigate(`/places/${id}`);
      } else {
        const { data } = await api.post('/places', payload);
        toast.success('Logement publié !');
        navigate(`/places/${data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
              ← Retour
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Modifier le logement' : 'Publier un logement'}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {isEdit ? 'Mettez à jour les informations de votre logement.' : 'Partagez votre espace avec des voyageurs du monde entier.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                Informations générales
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Titre <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Un appartement lumineux au cœur de Paris"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Décrivez votre logement, son ambiance, les points d'intérêt à proximité..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none bg-gray-50 focus:bg-white transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prix par nuit (€) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min={0}
                      step="0.01"
                      placeholder="75"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location card with interactive map */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-2 pb-3 border-b border-gray-100">
                Localisation <span className="text-rose-500">*</span>
              </h2>

              {/* Map */}
              <div className="mt-4 mb-5">
                <Suspense fallback={
                  <div className="h-64 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                }>
                  <MapPicker
                    lat={form.latitude}
                    lng={form.longitude}
                    onChange={handleMapSelect}
                  />
                </Suspense>
              </div>

              {/* Manual coordinate inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Latitude</label>
                  <input
                    name="latitude"
                    type="number"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                    step="any"
                    min={-90}
                    max={90}
                    placeholder="48.856600"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Longitude</label>
                  <input
                    name="longitude"
                    type="number"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                    step="any"
                    min={-180}
                    max={180}
                    placeholder="2.352200"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cliquez sur la carte ou saisissez les coordonnées manuellement
              </p>
            </div>

            {/* Amenities card */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
                  Équipements
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenities.map((amenity) => {
                    const selected = form.amenities.includes(amenity.id);
                    return (
                      <motion.button
                        key={amenity.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                          selected
                            ? 'bg-rose-50 border-rose-400 text-rose-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? 'bg-rose-500 border-rose-500' : 'border-gray-300'}`}>
                          {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        {amenity.name}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">{form.amenities.length} équipement{form.amenities.length !== 1 ? 's' : ''} sélectionné{form.amenities.length !== 1 ? 's' : ''}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pb-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-rose-200 transition-shadow disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {isEdit ? 'Mise à jour...' : 'Publication...'}
                  </>
                ) : (
                  isEdit ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Mettre à jour</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> Publier le logement</>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
