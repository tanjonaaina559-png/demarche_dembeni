import api from './api';

const authService = {
  /**
   * Register a new citizen account
   * @param {Object} data - { firstname, lastname, email, password }
   * @returns {Promise}
   */
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      throw { message: error.response?.data?.message || 'L\'inscription a échoué. Veuillez réessayer.' };
    }
  },

  /**
   * Login user (citizen or admin)
   * @param {string} email
   * @param {string} password
   * @returns {Promise} - Returns user object with token
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw { message: error.response?.data?.message || 'Email ou mot de passe incorrect, ou erreur réseau.' };
    }
  },

  /**
   * Logout user — appel backend + nettoyage local
   */
  logout: async () => {
    try {
      // Appel optionnel au backend (utile pour blacklist future)
      await api.post('/auth/logout').catch(() => {}); // ne pas bloquer si réseau coupé
    } finally {
      localStorage.removeItem('userInfo');
      sessionStorage.clear();
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    try {
      return userInfo ? JSON.parse(userInfo) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user && !!user.token;
  },

  /**
   * Validate token (optional - call on app load)
   * @returns {Promise}
   */
  validateToken: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('userInfo');
      throw error;
    }
  },
};

export default authService;
