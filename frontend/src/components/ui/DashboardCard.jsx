import React from 'react';
import { motion } from 'framer-motion';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, value, icon, color }) => {
  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4 }}
      style={{ color: color || '#18181b' }}
    >
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
      <div className={styles.icon} style={{ color: color || '#18181b', background: `${color}15` }}>
        {icon}
      </div>
      <div className={styles.bgDecoration} style={{ color: color || '#18181b' }}></div>
    </motion.div>
  );
};

export default DashboardCard;
