import api from './api';

const notificationService = {
  /**
   * Get all notifications for current user
   * @returns {Promise}
   */
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' };
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @returns {Promise}
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' };
    }
  },

  /**
   * Delete notification
   * @param {string} notificationId
   * @returns {Promise}
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete notification' };
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise}
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread');
      // Backend returns the full array; count the items
      return { count: (response.data || []).length, notifications: response.data || [] };
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },

  /**
   * Send message (contact form)
   * @param {Object} data - { name, email, phone, service, subject, message }
   * @returns {Promise}
   */
  sendMessage: async (data) => {
    try {
      const response = await api.post('/messages', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },
};

export default notificationService;
