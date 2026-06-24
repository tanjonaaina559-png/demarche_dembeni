import api from './api';

const adminService = {
  /**
   * Get dashboard statistics
   * @returns {Promise}
   */
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  /**
   * Get recent activities
   * @returns {Promise}
   */
  getActivities: async () => {
    try {
      const response = await api.get('/admin/activities');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch activities' };
    }
  },

  /**
   * Get all messages (contact forms)
   * @returns {Promise}
   */
  getMessages: async () => {
    try {
      const response = await api.get('/admin/messages');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  /**
   * Get message by ID
   * @param {string} messageId
   * @returns {Promise}
   */
  getMessage: async (messageId) => {
    try {
      const response = await api.get(`/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch message' };
    }
  },

  /**
   * Mark message as read
   * @param {string} messageId
   * @returns {Promise}
   */
  markMessageAsRead: async (messageId) => {
    try {
      const response = await api.put(`/admin/messages/${messageId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update message' };
    }
  },

  /**
   * Delete message
   * @param {string} messageId
   * @returns {Promise}
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete message' };
    }
  },

  /**
   * Export statistics report
   * @returns {Promise}
   */
  exportReport: async () => {
    try {
      const response = await api.get('/admin/report/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export report' };
    }
  },
};

export default adminService;
