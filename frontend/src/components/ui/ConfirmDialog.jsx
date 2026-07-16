import React from 'react';
import { createPortal } from 'react-dom';

/**
 * ConfirmDialog — Modale de confirmation sans Framer Motion.
 * AnimatePresence + React Fragment (<>) dans AnimatePresence cause insertBefore crashes.
 * On utilise un portal stable dans document.body avec CSS transitions uniquement.
 */
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmation',
  message = 'Êtes-vous sûr ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'default',
  isDangerous = false,
}) => {
  if (!isOpen) return null;

  const isDestructive = type === 'danger' || isDangerous;

  const content = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Dialog box */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          background: '#fff',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: `1px solid ${isDestructive ? '#FEE2E2' : '#E5E7EB'}`,
        }}
      >
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: isDestructive ? '#FEF2F2' : '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 0 20px 0', fontSize: '1.5rem',
        }}>
          {isDestructive ? '🗑️' : '⚠️'}
        </div>

        <h2 style={{
          margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '700',
          color: '#111827', fontFamily: '"Inter", sans-serif',
        }}>
          {title}
        </h2>

        <p style={{
          margin: '0 0 24px 0', fontSize: '0.92rem',
          color: '#6B7280', lineHeight: '1.6',
          fontFamily: '"Inter", sans-serif',
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 18px', borderRadius: '8px',
              border: '1px solid #D1D5DB', background: '#fff',
              color: '#374151', fontWeight: '600', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: '"Inter", sans-serif',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 18px', borderRadius: '8px',
              border: 'none',
              background: isDestructive ? '#DC2626' : '#059669',
              color: '#fff', fontWeight: '600', cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: '"Inter", sans-serif',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isDestructive ? '#B91C1C' : '#047857'}
            onMouseLeave={e => e.currentTarget.style.background = isDestructive ? '#DC2626' : '#059669'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ConfirmDialog;
