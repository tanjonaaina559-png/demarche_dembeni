import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination
 * @param {number} initialPage - Starting page number
 * @param {number} pageSize - Items per page
 * @returns {Object} { page, pageSize, setPage, setPageSize, goNext, goPrev, goFirst, goLast }
 */
export const usePagination = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const goNext = useCallback(() => {
    setPage((p) => (p < totalPages ? p + 1 : p));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  const goFirst = useCallback(() => {
    setPage(1);
  }, []);

  const goLast = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const goToPage = useCallback((pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  }, [totalPages]);

  return {
    page,
    pageSize: itemsPerPage,
    totalItems,
    totalPages,
    setPage,
    setPageSize: setItemsPerPage,
    setTotalItems,
    goNext,
    goPrev,
    goFirst,
    goLast,
    goToPage,
  };
};

export default usePagination;
