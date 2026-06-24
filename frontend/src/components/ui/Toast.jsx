import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Toast.module.css';
import { FaCheck, FaExclamation, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Toast component – displays temporary notifications.
 * Props: isOpen, onClose, message, type ('success'|'error'|'info'|'warning'), duration
 */
const Toast = ({ isOpen, onClose, message, type = 'info', duration = 4000 }) => {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck />;
      case 'error':
        return <FaTimes />;
      case 'warning':
        return <FaExclamation />;
      case 'info':
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`${styles.toast} ${styles[type]}`}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
        >
          <div className={styles.icon}>{getIcon()}</div>
          <p className={styles.message}>{message}</p>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close toast">
            <FaTimes />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
