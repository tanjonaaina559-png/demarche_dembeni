import React from 'react';
import styles from './EmptyState.module.css';

/**
 * Simple empty state component.
 * Props: message (string) – text to display when there is no data.
 */
const EmptyState = ({ message = 'No data available' }) => (
  <div className={styles.emptyState}>
    <p className={styles.message}>{message}</p>
  </div>
);

export default EmptyState;
