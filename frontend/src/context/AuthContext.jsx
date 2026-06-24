import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ── Fonction de logout centralisée ───────────────────────────────────
  const logout = useCallback(async (message = null) => {
    await authService.logout();    // Appel backend + nettoyage localStorage
    sessionStorage.clear();
    setUser(null);
    setError(null);
    navigate('/', { replace: true, state: message ? { logoutMessage: message } : {} });
  }, [navigate]);

  // ── Écouter l'événement 'auth:expired' émis par api.js ────────────────
  useEffect(() => {
    const handleExpired = () => {
      logout('Votre session a expiré. Veuillez vous reconnecter.');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [logout]);

  // ── Initialisation au démarrage ───────────────────────────────────────
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.token) {
          setUser(currentUser);
        } else {
          authService.logout(); // Nettoie les données invalides
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMsg = err.message || 'Échec de la connexion.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      const errorMsg = err.message || 'Échec de l\'inscription.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    setUser,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isCitizen: user?.role === 'citizen',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
