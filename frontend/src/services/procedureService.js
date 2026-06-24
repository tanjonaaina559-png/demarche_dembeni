import api from './api';

const procedureService = {
  /**
   * Get all procedures (public)
   * @returns {Promise}
   */
  getAllProcedures: async () => {
    try {
      const response = await api.get('/procedures');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch procedures' };
    }
  },

  /**
   * Get procedure by ID
   * @param {string} id
   * @returns {Promise}
   */
  getProcedure: async (id) => {
    try {
      const response = await api.get(`/procedures/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch procedure' };
    }
  },

  /**
   * Create new procedure (admin only)
   * @param {Object} data - { title, description, steps, documents_required }
   * @returns {Promise}
   */
  createProcedure: async (data) => {
    try {
      const response = await api.post('/procedures', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create procedure' };
    }
  },

  /**
   * Update procedure (admin only)
   * @param {string} id
   * @param {Object} data
   * @returns {Promise}
   */
  updateProcedure: async (id, data) => {
    try {
      const response = await api.put(`/procedures/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update procedure' };
    }
  },

  /**
   * Delete procedure (admin only)
   * @param {string} id
   * @returns {Promise}
   */
  deleteProcedure: async (id) => {
    try {
      const response = await api.delete(`/procedures/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete procedure' };
    }
  },
};

export default procedureService;
