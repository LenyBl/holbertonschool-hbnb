import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToMarker({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 });
    }
  }, [lat, lng, map]);
  return null;
}

/**
 * MapPicker — dual-mode map component
 *
 * Edit mode  (onChange provided): click to place/move the pin
 * View mode  (readOnly=true):     displays the location, no click
 */
export default function MapPicker({ lat, lng, onChange, readOnly = false, title }) {
  const hasPosition = lat !== '' && lng !== '' && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  const parsedLat = hasPosition ? parseFloat(lat) : null;
  const parsedLng = hasPosition ? parseFloat(lng) : null;
  const center = hasPosition ? [parsedLat, parsedLng] : [48.8566, 2.3522];
  const zoom = hasPosition ? 13 : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
    >
      {/* Banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${readOnly ? 'bg-gray-50 border-gray-100' : 'bg-indigo-50 border-indigo-100'}`}>
        <svg className={`w-4 h-4 shrink-0 ${readOnly ? 'text-gray-400' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className={`text-xs font-medium ${readOnly ? 'text-gray-500' : 'text-indigo-700'}`}>
          {readOnly
            ? (hasPosition ? 'Localisation du logement' : 'Coordonnées non disponibles')
            : 'Cliquez sur la carte pour définir la position'}
        </p>
        {hasPosition && (
          <span className={`ml-auto text-xs font-mono ${readOnly ? 'text-gray-400' : 'text-indigo-500'}`}>
            {parsedLat.toFixed(5)}, {parsedLng.toFixed(5)}
          </span>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: readOnly ? '380px' : '300px', width: '100%' }}
        className="z-0"
        scrollWheelZoom={!readOnly}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Edit mode: click handler */}
        {!readOnly && onChange && <ClickHandler onSelect={onChange} />}

        {/* Marker */}
        {hasPosition && (
          <>
            <Marker position={[parsedLat, parsedLng]}>
              {readOnly && title && (
                <Popup className="rounded-xl">
                  <div className="text-sm font-semibold text-gray-800 py-1">{title}</div>
                  <div className="text-xs text-gray-500 font-mono">{parsedLat.toFixed(5)}, {parsedLng.toFixed(5)}</div>
                </Popup>
              )}
            </Marker>
            {/* Smooth fly-to when coords change (edit mode) */}
            {!readOnly && <FlyToMarker lat={parsedLat} lng={parsedLng} />}
          </>
        )}
      </MapContainer>
    </motion.div>
  );
}
