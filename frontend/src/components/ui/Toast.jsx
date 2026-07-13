import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import styles from './Toast.module.css';

// ─── Stable singleton container ──────────────────────────────────────────────
// A dedicated DOM node that lives for the entire app lifetime.
// This prevents the removeChild NotFoundError that occurs when createPortal
// targets document.body directly and the parent component unmounts during
// a framer-motion exit animation.
let toastRoot = null;
const getToastRoot = () => {
  if (!toastRoot || !document.body.contains(toastRoot)) {
    toastRoot = document.createElement('div');
    toastRoot.id = 'toast-portal-root';
    toastRoot.setAttribute('aria-live', 'assertive');
    toastRoot.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastRoot);
  }
  return toastRoot;
};

/**
 * Toast — Professional top-right notification
 * Props:
 *   isOpen        boolean
 *   onClose       function
 *   message       string
 *   type          'success' | 'error' | 'warning' | 'info'
 *   duration      number (ms, default 5000)
 */
const Toast = ({ isOpen, onClose, message, type = 'info', duration = 5000 }) => {
  const [progress, setProgress] = useState(100);
  const [portalTarget, setPortalTarget] = useState(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initialise the stable portal container on mount only
  useEffect(() => {
    setPortalTarget(getToastRoot());
    return () => {
      // Do NOT remove toastRoot on unmount — it is reused across navigation.
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startProgress = useCallback(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        onClose();
      }
    }, 30);
  }, [duration, onClose]);

  useEffect(() => {
    if (isOpen && duration) {
      setProgress(100);
      startProgress();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, duration, startProgress]);

  const icons = {
    success: <FaCheck />,
    error: <FaExclamationCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />,
  };

  const labels = {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
  };

  // Guard: don't render until the stable container is ready
  if (!portalTarget) return null;

  const toastContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.toastWrapper} ${styles[type]}`}
          role="alert"
          initial={{ x: 420, opacity: 0, y: 0 }}
          animate={{ x: 0, opacity: 1, y: 0 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          {/* Icon */}
          <div className={styles.iconWrapper}>
            {icons[type]}
          </div>

          {/* Content */}
          <div className={styles.content}>
            <span className={styles.typeLabel}>{labels[type]}</span>
            <p className={styles.message}>{message}</p>
          </div>

          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fermer la notification"
          >
            <FaTimes />
          </button>

          {/* Progress bar */}
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render into the stable singleton container — never directly into document.body
  return createPortal(toastContent, portalTarget);
};

export default Toast;
