import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Toast from '../../components/ui/Toast';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [errorInline, setErrorInline] = useState('');

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });

  const validatePassword = (pass) => {
    // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInline('');

    if (!password || !confirmPassword) {
      setErrorInline('Tous les champs sont obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      setErrorInline('Les mots de passe ne correspondent pas');
      return;
    }

    if (!validatePassword(password)) {
      setErrorInline('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      showToast(data.message || 'Mot de passe modifié avec succès.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lien invalide ou expiré', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Toast 
        isOpen={toast.open} 
        onClose={() => setToast({ ...toast, open: false })} 
        message={toast.message} 
        type={toast.type} 
      />
      
      <div className="auth-container" style={{ maxWidth: '450px' }}>
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src="/logodembeni.png" alt="Ville de Dembéni" />
            </Link>
            <h2>Nouveau mot de passe</h2>
            <p>Veuillez entrer votre nouveau mot de passe.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            
            <div className="form-group">
              <label>Nouveau mot de passe <span style={{ color: '#DC2626' }}>*</span></label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmer mot de passe <span style={{ color: '#DC2626' }}>*</span></label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {errorInline && (
              <div style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem', marginTop: '-0.5rem', fontWeight: 500 }}>
                {errorInline}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {loading ? <Loader2 size={20} className="spin" /> : null}
              {loading ? 'Modification...' : 'Modifier le mot de passe'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#16A34A', fontWeight: '500' }}>
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
