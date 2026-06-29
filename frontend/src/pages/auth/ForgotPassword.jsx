import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Toast from '../../components/ui/Toast';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [success, setSuccess] = useState(false);

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Veuillez entrer votre adresse email', 'error');
      return;
    }
    
    // Valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Adresse email invalide', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      showToast(data.message || 'Un lien de réinitialisation a été envoyé.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors de l\'envoi', 'error');
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
            <h2>Mot de passe oublié</h2>
            <p>Entrez votre adresse email pour réinitialiser votre mot de passe.</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label>Adresse email <span style={{ color: '#DC2626' }}>*</span></label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
                style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading ? <Loader2 size={20} className="spin" /> : null}
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="success-message"
              style={{ textAlign: 'center', padding: '1rem 0' }}
            >
              <CheckCircle size={48} color="#16A34A" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#164022', marginBottom: '0.5rem' }}>Email envoyé !</h3>
              <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. 
                Veuillez vérifier votre boîte de réception. Ce lien expire dans 15 minutes.
              </p>
            </motion.div>
          )}

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

export default ForgotPassword;
