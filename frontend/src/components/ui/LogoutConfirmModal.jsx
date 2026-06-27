import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LogoutConfirmModal
 * Props:
 *   isOpen     – boolean
 *   onClose    – () => void  (cancel)
 *   onConfirm  – async () => void  (perform actual logout)
 */
const LogoutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  // ── Keyboard support ────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') handleConfirm();
  }, [isOpen, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
      // Show success toast briefly before the page redirects
      setToast(true);
    } catch {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Success Toast ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            style={{
              position: 'fixed', bottom: '28px', right: '28px', zIndex: 99999,
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#18181b', color: '#fff',
              padding: '14px 20px', borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
              fontFamily: '"Inter", sans-serif', fontSize: '0.9rem', fontWeight: 500,
              borderLeft: '4px solid #10B981',
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>✓</span>
            Vous êtes déconnecté avec succès.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            {/* Dialog */}
            <motion.div
              key="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-modal-title"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: 'fixed', inset: 0, zIndex: 9001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                pointerEvents: 'none',
              }}
            >
              <div style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '2.25rem 2rem 2rem',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                fontFamily: '"Inter", sans-serif',
                textAlign: 'center',
              }}>
                {/* Icon */}
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.6rem',
                }}>
                  🚪
                </div>

                {/* Title */}
                <h2 id="logout-modal-title" style={{
                  fontSize: '1.2rem', fontWeight: 700,
                  color: '#18181b', marginBottom: '0.6rem',
                  fontFamily: '"Poppins", sans-serif',
                }}>
                  Confirmation
                </h2>

                {/* Message */}
                <p style={{
                  fontSize: '0.9rem', color: '#6b7280',
                  lineHeight: 1.6, marginBottom: '1.75rem',
                }}>
                  Êtes-vous sûr de vouloir vous déconnecter&nbsp;?
                </p>

                {/* Hint */}
                <p style={{
                  fontSize: '0.72rem', color: '#a1a1aa',
                  marginBottom: '1.5rem', marginTop: '-1rem',
                }}>
                  Appuyez sur <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: '#f4f4f5', border: '1px solid #e4e4e7', fontSize: '0.7rem' }}>Entrée</kbd> pour confirmer ou <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: '#f4f4f5', border: '1px solid #e4e4e7', fontSize: '0.7rem' }}>Échap</kbd> pour annuler.
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Non */}
                  <button
                    onClick={onClose}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '0.8rem',
                      border: '1.5px solid #e4e4e7',
                      borderRadius: '12px', background: '#fff',
                      fontSize: '0.9rem', fontWeight: 600,
                      color: '#374151', cursor: 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      transition: 'all 0.2s',
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!loading) e.target.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { e.target.style.background = '#fff'; }}
                  >
                    ❌ Non
                  </button>

                  {/* Oui */}
                  <button
                    onClick={handleConfirm}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '0.8rem',
                      border: 'none', borderRadius: '12px',
                      background: loading
                        ? '#ef9999'
                        : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      fontSize: '0.9rem', fontWeight: 600,
                      color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: '"Inter", sans-serif',
                      boxShadow: '0 4px 14px rgba(220,38,38,0.28)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '6px',
                    }}
                    onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: '14px', height: '14px', borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          display: 'inline-block',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                        Déconnexion...
                      </>
                    ) : '✅ Oui, se déconnecter'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default LogoutConfirmModal;
