import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', config.method.toUpperCase(), config.url);
    
    // Check both localStorage formats for token as requested
    const tokenStr = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    let activeToken = tokenStr;
    if (!activeToken && userInfoStr) {
      try {
        const parsed = JSON.parse(userInfoStr);
        if (parsed?.token) {
          activeToken = parsed.token;
        }
      } catch (err) {}
    }
    
    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and map specific error codes
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', error);
    
    let customMessage = 'Network Error backend inaccessible';
    
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        customMessage = '404 route introuvable';
      } else if (status === 401) {
        customMessage = '401 Non autorisé';
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        sessionStorage.clear();
        
        const path = window.location.pathname;
        const publicPaths = ['/', '/login', '/admin/login', '/inscription'];
        if (!publicPaths.includes(path)) {
          window.dispatchEvent(new CustomEvent('auth:expired'));
          window.location.href = '/';
        }
      } else if (status === 500) {
        customMessage = '500 Erreur serveur';
      } else {
        customMessage = error.response.data?.message || `Erreur ${status}`;
      }
    }
    
    // Override error message object
    error.message = customMessage;
    if (error.response && error.response.data) {
      error.response.data.message = customMessage;
    }
    
    return Promise.reject(error);
  }
);

export default api;
