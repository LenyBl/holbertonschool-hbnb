import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import { PageLoader, LoadingSpinner } from '../components/LoadingSpinner';
import { lazy, Suspense } from 'react';

const MapPicker = lazy(() => import('../components/MapPicker'));
import Modal from '../components/Modal';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const toast = useToast();

  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [placeRes, reviewsRes] = await Promise.all([
        api.get(`/places/${id}`),
        api.get('/reviews'),
      ]);
      setPlace(placeRes.data);
      const placeReviews = reviewsRes.data.filter((r) => r.place_id === id);
      setReviews(placeReviews);
    } catch {
      toast.error('Logement introuvable');
      navigate('/places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const isOwner = user?.id === place?.owner?.id;
  const alreadyReviewed = reviews.some((r) => r.user_id === user?.id);
  // Admin can review any place they don't own; regular users same rule
  const canReview = isAuthenticated && !isOwner && !alreadyReviewed;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) { toast.error('Veuillez sélectionner une note'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { text: reviewText, rating: reviewRating, place_id: id });
      toast.success('Avis publié !');
      setReviewModalOpen(false);
      setReviewText('');
      setReviewRating(0);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la publication';
      if (msg.includes('own place')) toast.error('Vous ne pouvez pas noter votre propre logement.');
      else if (msg.includes('already reviewed')) toast.error('Vous avez déjà laissé un avis pour ce logement.');
      else if (err.response?.status === 401) toast.error('Session expirée. Reconnectez-vous.');
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlace = async () => {
    setDeleting(true);
    try {
      await api.delete(`/places/${id}`);
      toast.success('Logement supprimé avec succès.');
      navigate('/places');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Impossible de supprimer ce logement.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Avis supprimé');
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      toast.error('Impossible de supprimer cet avis');
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <PageLoader />;
  if (!place) return null;

  const imageUrl = `https://picsum.photos/seed/${id}/1200/600`;

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-80 md:h-[28rem] overflow-hidden bg-gray-200"
      >
        <img
          src={imageUrl}
          alt={place.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-white transition-colors"
          >
            ← Retour
          </motion.button>
        </div>

        {/* Owner actions */}
        {(isOwner || isAdmin) && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Link to={`/places/${id}/edit`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Modifier
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-rose-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:bg-rose-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Supprimer
            </motion.button>
          </div>
        )}

        {/* Price on image */}
        <div className="absolute bottom-6 right-6">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-xl">
            <div className="text-2xl font-bold text-gray-900">{place.price}€</div>
            <div className="text-gray-500 text-xs">par nuit</div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Title & rating */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{place.title}</h1>
                  {avgRating && (
                    <div className="flex items-center gap-2">
                      <StarRating value={Math.round(avgRating)} />
                      <span className="text-sm font-semibold text-gray-800">{avgRating}</span>
                      <span className="text-sm text-gray-500">({reviews.length} avis)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}</span>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Host */}
              {place.owner && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {place.owner.first_name?.[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Logement proposé par</p>
                    <p className="font-semibold text-gray-900">{place.owner.first_name} {place.owner.last_name}</p>
                    <p className="text-sm text-gray-500">{place.owner.email}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {place.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">{place.description}</p>
                </div>
              )}

              {/* Amenities */}
              {place.amenities?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {place.amenities.map((amenity, i) => (
                      <motion.div
                        key={amenity.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive map */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Localisation</h2>
                <Suspense fallback={
                  <div className="h-96 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                }>
                  <MapPicker
                    lat={place.latitude}
                    lng={place.longitude}
                    readOnly
                    title={place.title}
                  />
                </Suspense>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Avis {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
                  </h2>
                  {canReview && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setReviewModalOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm"
                    >
                      + Laisser un avis
                    </motion.button>
                  )}
                  {isAuthenticated && isOwner && (
                    <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> Votre logement
                    </span>
                  )}
                  {isAuthenticated && !isOwner && alreadyReviewed && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Avis déjà publié
                    </span>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="mb-3 flex justify-center text-gray-300"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                    <p className="text-gray-500 text-sm">Aucun avis pour le moment.</p>
                    {canReview && (
                      <button onClick={() => setReviewModalOpen(true)} className="text-rose-500 text-sm font-medium mt-2 hover:text-rose-600">
                        Soyez le premier à laisser un avis !
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review, i) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        index={i}
                        canDelete={review.user_id === user?.id || isAdmin}
                        onDelete={handleDeleteReview}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right: Booking card (sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-gray-900">{place.price}€</span>
                  <span className="text-gray-500">/ nuit</span>
                </div>

                {avgRating && (
                  <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
                    <StarRating value={Math.round(avgRating)} size="sm" />
                    <span className="text-sm font-semibold">{avgRating}</span>
                    <span className="text-sm text-gray-400">· {reviews.length} avis</span>
                  </div>
                )}

                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Connectez-vous pour réserver</p>
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold text-sm shadow-lg"
                      >
                        Se connecter
                      </motion.button>
                    </Link>
                  </div>
                ) : isOwner ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Vous êtes l'hôte de ce logement</p>
                    <Link to={`/places/${id}/edit`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Modifier le logement
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-rose-200 transition-shadow"
                      onClick={() => toast.info('La réservation sera bientôt disponible !')}
                    >
                      Réserver maintenant
                    </motion.button>
                    <p className="text-xs text-gray-400 mt-3">Vous ne serez pas débité pour l'instant</p>
                  </div>
                )}

                {/* Details summary */}
                <div className="mt-6 space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coordonnées</span>
                    <span className="text-gray-900 font-medium">{place.latitude?.toFixed(3)}, {place.longitude?.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Équipements</span>
                    <span className="text-gray-900 font-medium">{place.amenities?.length || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Laisser un avis">
        <form onSubmit={handleReviewSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <div className="flex items-center gap-2">
              <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
              <span className="text-sm text-gray-500">{reviewRating > 0 ? `${reviewRating}/5` : 'Sélectionnez'}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Votre avis</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={4}
              placeholder="Partagez votre expérience..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none bg-gray-50 focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setReviewModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold disabled:opacity-70"
            >
              {submitting ? 'Publication...' : 'Publier'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete place confirmation modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Supprimer ce logement">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
            <svg className="w-5 h-5 mt-0.5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <p className="text-sm font-semibold text-rose-800">Action irréversible</p>
              <p className="text-sm text-rose-700 mt-1">
                La suppression de <span className="font-semibold">« {place?.title} »</span> effacera également tous les avis associés. Cette action est définitive.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleDeletePlace}
              disabled={deleting}
              className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <><LoadingSpinner size="sm" /> Suppression...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> Confirmer la suppression</>
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
