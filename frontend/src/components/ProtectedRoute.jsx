import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './ui/Loader';

/**
 * ProtectedRoute — Vérifie authentification, rôle et statut.
 * Non authentifié → redirige vers "/" (Accueil)
 * Mauvais rôle    → redirige vers le bon dashboard
 * Pending/Rejected→ affiche un écran dédié
 */
const ProtectedRoute = ({ allowedRoles, requiredStatus }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Loader pendant la vérification initiale
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader />
      </div>
    );
  }

  // ① Non authentifié → Accueil (pas /login)
  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace state={{ from: location, authRequired: true }} />;
  }

  // ② Rôle incorrect → redirection vers le bon espace
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard';
    return <Navigate to={redirectPath} replace />;
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
          <h2 style={{ color: 'var(--rouge-600)', marginBottom: '15px' }}>Accès refusé</h2>
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
  }

  return <Outlet />;
};

export default ProtectedRoute;
