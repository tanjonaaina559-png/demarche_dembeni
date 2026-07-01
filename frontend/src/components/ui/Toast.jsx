import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import styles from './Toast.module.css';

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
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

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

  const toastContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.toastWrapper} ${styles[type]}`}
          role="alert"
          aria-live="polite"
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

  // Render into a portal so z-index is always on top
  return createPortal(toastContent, document.body);
};

export default Toast;
