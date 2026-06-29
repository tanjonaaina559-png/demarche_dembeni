import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaUpload, FaTrash, FaImage, FaFolder, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUrl';

const ImageUpload = ({ value, onChange, label = "Image", placeholder = "URL de l'image" }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [library, setLibrary] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const fetchLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    try {
    const res = await api.get('/cms/media');
      setLibrary(res.data || []);
    } catch {
      setLibrary([]);
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    if (showLibrary) fetchLibrary();
  }, [showLibrary, fetchLibrary]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format non supporté (JPG, PNG, WEBP acceptés)');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'cms');

    console.log('========== FRONTEND: UPLOAD START ==========');
    console.log('Sending FormData to /cms/media');
    for (let [key, val] of formData.entries()) {
      console.log(`FormData [${key}]:`, val instanceof File ? `File Object (${val.name})` : val);
    }
    
    try {
      const response = await api.post('/cms/media', formData);
      console.log('========== FRONTEND: UPLOAD SUCCESS ==========');
      console.log('API Response:', response.data);
      console.log('Cloudinary URL returned:', response.data.media.url);
      
      onChange(response.data.media.url);
    } catch (err) {
      console.error('========== FRONTEND: UPLOAD FAILED ==========', err);
      setError("Erreur lors de l'upload: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePickFromLibrary = (mediaItem) => {
    onChange(mediaItem.url);
    setShowLibrary(false);
  };

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</label>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ flex: 1, minWidth: '120px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Uploader une nouvelle image"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.9rem',
                  backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                <FaUpload /> {uploading ? 'Upload...' : 'Uploader'}
              </button>
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                title="Choisir depuis la médiathèque"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 0.9rem',
                  backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                <FaFolder /> Médiathèque
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  title="Supprimer l'image"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px',
                    backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <FaTrash />
                </button>
              )}
            </div>
            {error && <div style={{ color: '#DC2626', fontSize: '0.82rem', marginTop: '0.3rem' }}>{error}</div>}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              style={{ display: 'none' }}
            />
          </div>

          {/* Preview */}
          <div style={{
            width: '110px', height: '74px', borderRadius: '8px', overflow: 'hidden',
            border: '1px solid #E5E7EB', backgroundColor: '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {value ? (
              <img
                src={getImageUrl(value)}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            ) : (
              <FaImage style={{ color: '#9CA3AF', fontSize: '1.4rem' }} />
            )}
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showLibrary && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '2rem',
            width: '100%', maxWidth: '780px', maxHeight: '85vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#164022', fontSize: '1.1rem' }}>
                <FaFolder style={{ marginRight: '8px', color: '#2563EB' }} /> Médiathèque CMS
              </h3>
              <button
                onClick={() => setShowLibrary(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#6B7280' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Upload bar inside library */}
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                Uploader une nouvelle image dans la médiathèque :
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', backgroundColor: '#16A34A', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                }}
              >
                <FaUpload /> {uploading ? 'Upload en cours...' : 'Choisir un fichier (JPG/PNG/WEBP)'}
              </button>
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingLibrary ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Chargement...</div>
              ) : library.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                  <FaImage style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Aucun média disponible.<br />Uploadez une image ci-dessus.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {library.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handlePickFromLibrary(item)}
                      style={{
                        position: 'relative', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                        border: value === item.url ? '3px solid #16A34A' : '2px solid #E5E7EB',
                        aspectRatio: '1', transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#16A34A'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = value === item.url ? '#16A34A' : '#E5E7EB'}
                    >
                      <img
                        src={getImageUrl(item.url)}
                        alt={item.alt || item.filename}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = getImageUrl(); }}
                      />
                      {value === item.url && (
                        <div style={{
                          position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px',
                          borderRadius: '50%', background: '#16A34A', display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <FaCheck style={{ color: 'white', fontSize: '10px' }} />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(0,0,0,0.5)', color: 'white',
                        fontSize: '0.68rem', padding: '3px 6px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {item.originalName || item.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUpload;
