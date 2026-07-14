import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

// ─── Stable singleton container ──────────────────────────────────────────────
// A single persistent DOM node that lives for the entire app lifetime.
// Targeting document.body directly causes removeChild NotFoundError when
// framer-motion's async exit animation outlives the owning component.
let portalRoot = null;
const getPortalRoot = () => {
  if (!portalRoot || !document.body.contains(portalRoot)) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'portal-modal-root';
    document.body.appendChild(portalRoot);
  }
  return portalRoot;
};

/**
 * PortalModal
 * Renders into a stable singleton div appended once to document.body.
 * The overlay is a fixed full-screen flex container that centers the modal.
 * NO transform/translate/absolute on the modal itself.
 */
const PortalModal = ({ isOpen, onClose, title, children, width = '900px' }) => {
  const containerRef = useRef(null);

  // Initialise the stable container once on mount; never tear it down.
  useEffect(() => {
    containerRef.current = getPortalRoot();
    console.log('[PortalModal] MOUNT — container:', containerRef.current?.id);
    return () => {
      console.log('[PortalModal] UNMOUNT');
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Guard: don't render until stable container is registered
  if (!containerRef.current) return null;

  // Overlay: fixed, full screen, flex-centered
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.52)',
    zIndex: 99999,
    backdropFilter: 'blur(3px)',
    padding: '20px',
  };

  // Modal: relative inside the flex overlay — no positioning tricks needed
  const modalStyle = {
    position: 'relative',
    width: `min(${width}, 95vw)`,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    position: 'sticky',
    top: 0,
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1.25rem 1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: '20px 20px 0 0',
    flexShrink: 0,
  };

  const closeBtnStyle = {
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
    fontSize: '1rem',
    transition: 'background 0.2s',
    flexShrink: 0,
  };

  const bodyStyle = {
    padding: '1.75rem',
    flex: 1,
    overflowY: 'auto',
  };

  const portal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="portal-overlay"
          style={overlayStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="portal-modal"
            style={modalStyle}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={headerStyle}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
                {title}
              </h2>
              <button
                style={closeBtnStyle}
                onClick={onClose}
                onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                aria-label="Fermer"
              >
                <FaTimes />
              </button>
            </div>
            <div style={bodyStyle}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into the stable singleton — never directly into document.body
  return ReactDOM.createPortal(portal, containerRef.current);
};

export default PortalModal;
