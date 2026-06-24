import api from './api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const requestService = {
  /**
   * Create new request (citizen)
   * @param {FormData} formData - Contains procedureId and documents
   * @returns {Promise}
   */
  createRequest: async (formData) => {
    try {
      const response = await api.post('/requests', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create request' };
    }
  },

  /**
   * Get my requests (citizen)
   * @returns {Promise}
   */
  getMyRequests: async () => {
    try {
      const response = await api.get('/requests/my-requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch requests' };
    }
  },

  /**
   * Get all requests (admin)
   * @returns {Promise}
   */
  getAllRequests: async () => {
    try {
      const response = await api.get('/requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch requests' };
    }
  },

  /**
   * Get request by ID
   * @param {string} id
   * @returns {Promise}
   */
  getRequest: async (id) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch request' };
    }
  },

  /**
   * Update request status (admin)
   * @param {string} id
   * @param {string} status - 'pending', 'approved', 'rejected', 'completed'
   * @returns {Promise}
   */
  updateRequestStatus: async (id, status) => {
    try {
      const response = await api.put(`/requests/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update request' };
    }
  },

  /**
   * Generate PDF receipt for request
   * @param {string} id
   * @returns {Promise}
   */
  generatePdfReceipt: async (id) => {
    try {
      const response = await api.get(`/requests/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate PDF' };
    }
  },

  /**
   * Download file from request
   * @param {string} filename
   */
  downloadFile: (filename) => {
    window.location.href = `${API_BASE}/uploads/${filename}`;
  },
};

export default requestService;
