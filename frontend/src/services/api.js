import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60s — needed for Cloudinary image uploads
  withCredentials: true,
  // NOTE: Do NOT set a global Content-Type header here.
  // When sending FormData, axios must auto-detect and set
  // 'multipart/form-data; boundary=...' — manually overriding
  // it destroys the boundary and breaks Multer parsing.
});

// Request interceptor: Add JWT token + correct Content-Type
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', config.method.toUpperCase(), config.url);

    // ── Auth token ──────────────────────────────────────────────────────
    const tokenStr = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');

    let activeToken = tokenStr;
    if (!activeToken && userInfoStr) {
      try {
        const parsed = JSON.parse(userInfoStr);
        if (parsed?.token) activeToken = parsed.token;
      } catch (err) {}
    }

    if (activeToken) {
      config.headers.Authorization = `Bearer ${activeToken}`;
    }

    // ── Content-Type ────────────────────────────────────────────────────
    // If the body is a FormData (file upload), do NOT set Content-Type.
    // axios + the browser will set it automatically to
    //   multipart/form-data; boundary=----WebKitFormBoundaryXXX
    // which Multer NEEDS to parse files.
    // For all other requests, default to application/json.
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // If it IS FormData, delete any previously-set Content-Type so the
    // browser boundary is not overwritten.
    else {
      delete config.headers['Content-Type'];
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
