import React from 'react';
import styles from './Pagination.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Pagination component – controls pagination of tabular data.
 * Props: currentPage, totalPages, onPageChange
 */
const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.navBtn}
        aria-label="Previous page"
      >
        <FaChevronLeft />
      </button>

      {startPage > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={styles.pageBtn}>
            1
          </button>
          {startPage > 2 && <span className={styles.ellipsis}>...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className={styles.ellipsis}>...</span>}
          <button onClick={() => onPageChange(totalPages)} className={styles.pageBtn}>
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navBtn}
        aria-label="Next page"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
