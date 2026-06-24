import { useState, useCallback } from 'react';

/**
 * Custom hook for managing API requests with loading and error states
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} immediate - Execute immediately on mount
 * @returns {Object} { data, loading, error, execute }
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    loading: status === 'pending',
  };
};

// Import useEffect at the top
import { useEffect } from 'react';

export default useAsync;
