import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ConfirmDialog.module.css';
import Button from './Button';

/**
 * ConfirmDialog component – displays a confirmation dialog.
 * Props: isOpen, onConfirm, onCancel, title, message, confirmText, cancelText
 */
const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={styles.dialog}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onCancel}>
                {cancelText}
              </Button>
              <Button variant={isDangerous ? 'danger' : 'primary'} onClick={onConfirm}>
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
