import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const MAP_LIBRARIES = ['places'];

/* ─── Default fallback location: Dembéni, Mayotte ─── */
const DEFAULT_CENTER = { lat: -12.8427, lng: 45.1970 };

/* ─── Map styling: clean, neutral ─── */
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  fullscreenControl: true,
  streetViewControl: true,
  mapTypeControl: false,
  gestureHandling: 'cooperative', // requires Ctrl+scroll on desktop, works naturally on mobile
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  ],
};

/**
 * InteractiveMap
 * Props:
 *   latitude       – number
 *   longitude      – number
 *   markerTitle    – string
 *   markerDesc     – string
 *   contactPhone   – string
 *   contactEmail   – string
 *   openingHours   – string
 *   mapsUrl        – string  (navigation URL)
 *   height         – string  (CSS value, default '450px')
 */
const InteractiveMap = ({
  latitude,
  longitude,
  markerTitle = 'Commune de Dembéni',
  markerDesc = 'Hôtel de Ville de Dembéni, Route Nationale 3, 97680 Dembéni, Mayotte',
  contactPhone = '+262 269 00 00 00',
  contactEmail = 'contact@dembeni.fr',
  openingHours = 'Lun–Jeu : 8h–12h / 13h30–16h30 · Ven : 8h–12h / 13h30–16h',
  mapsUrl,
  height = '450px',
}) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [mapRef, setMapRef] = useState(null);
  const markerRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const center = {
    lat: parseFloat(latitude) || DEFAULT_CENTER.lat,
    lng: parseFloat(longitude) || DEFAULT_CENTER.lng,
  };

  const navUrl =
    mapsUrl ||
    `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: MAP_LIBRARIES,
    preventGoogleFontsLoading: true,
  });

  const onLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  /* ── Error state ── */
  if (loadError || !apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div style={errorContainerStyle(height)}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-map-marked-alt" style={{ fontSize: '3rem', color: 'var(--vert-300)', marginBottom: '1rem', display: 'block' }} />
          <h3 style={{ color: 'var(--vert-800)', fontFamily: 'var(--font-head)', marginBottom: '0.5rem' }}>
            La carte est momentanément indisponible.
          </h3>
          <p style={{ color: 'var(--gris-500)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            La clé API Google Maps n'est pas configurée ou est invalide.
          </p>
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <i className="fas fa-external-link-alt" style={{ marginRight: '6px' }} />
            Ouvrir dans Google Maps
          </a>
        </div>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (!isLoaded) {
    return (
      <div style={skeletonStyle(height)}>
        <div style={skeletonInnerStyle} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }} />
            <span style={{ fontSize: '0.9rem' }}>Chargement de la carte…</span>
          </div>
        </div>
      </div>
    );
  }

  /* ── Map ── */
  return (
    <div style={{ position: 'relative', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={15}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        <Marker
          position={center}
          title={markerTitle}
          onLoad={(m) => { markerRef.current = m; }}
          onClick={() => setInfoOpen(true)}
          animation={2} /* DROP animation */
        />

        {infoOpen && (
          <InfoWindow
            position={center}
            onCloseClick={() => setInfoOpen(false)}
            options={{ pixelOffset: { width: 0, height: -40 } }}
          >
            <div style={infoWindowStyle}>
              {/* Header */}
              <div style={infoHeaderStyle}>
                <div style={infoIconStyle}>
                  <i className="fas fa-landmark" />
                </div>
                <h4 style={infoTitleStyle}>{markerTitle}</h4>
              </div>

              {/* Body */}
              <div style={infoBodyStyle}>
                <InfoRow icon="fas fa-map-marker-alt" text={markerDesc} />
                <InfoRow icon="fas fa-phone-alt" text={contactPhone} />
                <InfoRow icon="fas fa-envelope" text={contactEmail} />
                <InfoRow icon="far fa-clock" text={openingHours} />
              </div>

              {/* Footer CTA */}
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={ctaButtonStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--vert-700)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--vert-600)'; }}
              >
                <i className="fas fa-directions" style={{ marginRight: '6px' }} />
                Itinéraire
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

/* ── Small sub-component for info rows ── */
const InfoRow = ({ icon, text }) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
    <i className={icon} style={{ color: 'var(--vert-600)', marginTop: '3px', flexShrink: 0, fontSize: '0.8rem' }} />
    <span style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>{text}</span>
  </div>
);

/* ─── Styles ─── */
const errorContainerStyle = (height) => ({
  height,
  background: 'var(--gris-100)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--gris-200)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'var(--shadow-sm)',
});

const skeletonStyle = (height) => ({
  height,
  position: 'relative',
  borderRadius: 'var(--radius-lg)',
  overflow: 'hidden',
  background: 'var(--gris-200)',
});

const skeletonInnerStyle = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, var(--vert-800) 0%, var(--vert-600) 100%)',
  opacity: 0.6,
};

const infoWindowStyle = {
  fontFamily: '"Inter", sans-serif',
  maxWidth: '300px',
  padding: '4px',
};

const infoHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
  paddingBottom: '10px',
  borderBottom: '1px solid #e5e7eb',
};

const infoIconStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: 'var(--vert-600)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  flexShrink: 0,
};

const infoTitleStyle = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--vert-800)',
  lineHeight: 1.3,
  fontFamily: '"Poppins", sans-serif',
};

const infoBodyStyle = {
  marginBottom: '14px',
};

const ctaButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '8px 16px',
  background: 'var(--vert-600)',
  color: '#fff',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  transition: 'background 0.2s',
  cursor: 'pointer',
};

export default InteractiveMap;
