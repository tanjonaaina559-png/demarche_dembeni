import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './ui/Loader';

/**
 * ProtectedRoute — Vérifie authentification, rôle et statut.
 * Non authentifié   → redirige vers "/login"
 * Citoyen sur route admin → 403
 * Admin sur route citizen → /admin/dashboard
 * Pending/Rejected → affiche un écran dédié
 */
const ProtectedRoute = ({ allowedRoles, requiredStatus }) => {
  const { user, loading: loadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  // Loader pendant la vérification initiale ou si le profil utilisateur n'est pas encore complet
  if (loadingAuth || (isAuthenticated && !user?.role)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <Loader />
      </div>
    );
  }

  // ① Non authentifié → /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location, authRequired: true }} />;
  }

  // ② Rôle incorrect
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Citoyen qui essaie d'accéder à l'espace admin → 403
    if (user.role === 'citizen') {
      return <Navigate to="/403" replace />;
    }
    // Admin qui essaie d'accéder à l'espace citoyen → tableau de bord admin
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ③ Citoyen avec statut non approuvé
  if (user.role === 'citizen' && requiredStatus && user.status !== requiredStatus) {
    if (user.status === 'pending') {
      return (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '120px auto', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: 'var(--vert-800)', marginBottom: '15px' }}>Compte en attente de validation</h2>
          <p style={{ color: 'var(--gris-500)', lineHeight: '1.7' }}>
            Votre compte citoyen est actuellement en cours de vérification par l'administration de Dembéni.
            <br />Vous recevrez une notification dès que votre compte sera validé.
          </p>
          <a href="/" className="btn btn-primary" style={{ marginTop: '25px', display: 'inline-flex' }}>
            ← Retour à l'accueil
          </a>
        </div>
      );
    }

    if (user.status === 'rejected') {
      return (
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '120px auto', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: 'var(--rouge-600)', marginBottom: '15px' }}>Demande refusée</h2>
          <p style={{ color: 'var(--gris-500)', lineHeight: '1.7' }}>
            Votre compte a été refusé par l'administration de Dembéni.
            <br />Veuillez contacter la mairie pour plus d'informations.
          </p>
          <a href="/contact" className="btn btn-secondary" style={{ marginTop: '25px', display: 'inline-flex' }}>
            Contacter la mairie
          </a>
        </div>
      );
    }

    // Si le compte est suspendu ou autre statut non reconnu
    return (
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '120px auto', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: 'var(--rouge-600)', marginBottom: '15px' }}>Compte Inactif</h2>
        <p style={{ color: 'var(--gris-500)', lineHeight: '1.7' }}>
          Votre compte n'est pas autorisé à accéder à cet espace. (Statut actuel: {user.status})
          <br />Veuillez contacter l'administration de Dembéni.
        </p>
        <a href="/contact" className="btn btn-secondary" style={{ marginTop: '25px', display: 'inline-flex' }}>
          Contacter la mairie
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
