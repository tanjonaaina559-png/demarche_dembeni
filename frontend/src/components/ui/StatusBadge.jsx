import React from 'react';
import styles from './StatusBadge.module.css';
import classNames from 'classnames';

/**
 * StatusBadge displays a colored label based on a status string.
 * Props: status (string) – e.g., 'pending', 'approved', 'rejected', 'in_review', etc.
 */
const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: { label: 'En attente', className: styles.pending },
    approved: { label: 'Approuvée', className: styles.approved },
    rejected: { label: 'Rejetée', className: styles.rejected },
    in_review: { label: 'En cours', className: styles.inReview },
    completed: { label: 'Terminée', className: styles.completed },
    default: { label: status, className: styles.default },
  };
  const { label, className } = statusMap[status] || statusMap.default;
  return <span className={classNames(styles.badge, className)}>{label}</span>;
};

export default StatusBadge;
