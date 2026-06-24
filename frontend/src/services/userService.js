import api from './api';

const userService = {
  /**
   * Get all citizens (admin only)
   * @returns {Promise}
   */
  getAllCitizens: async () => {
    try {
      const response = await api.get('/admin/citizens');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch citizens' };
    }
  },

  /**
   * Get user profile (current user)
   * @returns {Promise}
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  /**
   * Update user profile
   * @param {Object} data - User data to update
   * @returns {Promise}
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      // Update localStorage if token not changed
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);
        localStorage.setItem('userInfo', JSON.stringify({ ...parsedUser, ...data }));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * Validate citizen (admin)
   * @param {string} citizenId
   * @returns {Promise}
   */
  validateCitizen: async (citizenId) => {
    try {
      const response = await api.put(`/admin/citizens/${citizenId}/validate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to validate citizen' };
    }
  },

  /**
   * Reject citizen (admin)
   * @param {string} citizenId
   * @returns {Promise}
   */
  rejectCitizen: async (citizenId) => {
    try {
      const response = await api.put(`/admin/citizens/${citizenId}/reject`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject citizen' };
    }
  },

  /**
   * Delete citizen (admin)
   * @param {string} citizenId
   * @returns {Promise}
   */
  deleteCitizen: async (citizenId) => {
    try {
      const response = await api.delete(`/admin/citizens/${citizenId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete citizen' };
    }
  },

  /**
   * Change password
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise}
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  },
};

export default userService;
