import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogoDembeni from '../components/ui/LogoDembeni';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in (This ensures no race condition)
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard';
      const redirectPath = location.state?.from || defaultPath;
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // We rely completely on the useEffect above to navigate once Context updates!
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la connexion';
      setError(errorMsg);
      setLoading(false);
    }
    // We purposefully don't set loading(false) on success because we want the spinner
    // to remain visible until the useEffect triggers the unmount and navigation.
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif' }}>
      <style>{`
        .auth-wrapper {
          width: 100%;
          max-width: 900px;
          min-height: 500px;
          border-radius: 20px;
          display: flex;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          position: relative;
          margin: 2rem;
          background: #fff;
          overflow: hidden;
        }

        .back-btn {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #164022;
          background: rgba(255,255,255,0.8);
          padding: 8px 16px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .back-btn:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        }

        .left-panel {
          flex: 1;
          background: #eef5ef;
          position: relative;
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 10;
          border-radius: 20px 0 0 20px;
        }

        .left-content h1 {
          font-family: 'Poppins', sans-serif;
          font-size: 2.8rem;
          line-height: 1.15;
          color: #164022;
          margin-bottom: 1rem;
          font-weight: 800;
        }
        
        .left-content p {
          font-size: 1rem;
          color: #4b6354;
          font-weight: 500;
          line-height: 1.5;
        }
        
        .footer-note {
          position: absolute;
          bottom: 2rem; left: 3rem;
          font-size: 0.75rem;
          color: #6a8271;
        }

        .arc-dark {
          position: absolute;
          top: -20%; bottom: -20%; right: -50px; width: 250px;
          border-radius: 50%;
          border-left: 20px solid #164022;
          z-index: 10;
          pointer-events: none;
        }
        .arc-light {
          position: absolute;
          top: -20%; bottom: -20%; right: -150px; width: 280px;
          background: #8dc19c;
          border-radius: 50%;
          z-index: 9;
          pointer-events: none;
        }

        .right-panel {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 0 20px 20px 0;
          overflow: hidden; 
        }

        .mesh-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-color: #fbecec; 
          background-image: 
            radial-gradient(circle at 10% 20%, #409859 0%, transparent 60%),
            radial-gradient(circle at 90% 80%, #d34a4a 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 0%, transparent 60%);
          filter: blur(40px);
          transform: scale(1.2);
        }

        .glass-card {
          position: relative;
          z-index: 20;
          width: 100%;
          max-width: 400px;
          padding: 2.5rem 2.5rem;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        
        .glass-card h2 {
          font-family: 'Poppins', sans-serif;
          text-align: center;
          color: #164022;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        .input-grp { width: 100%; margin-bottom: 1.2rem; position: relative; }
        .input-grp input {
          width: 100%;
          padding: 0.95rem 2.5rem 0.95rem 1.2rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s;
          color: #333;
        }
        .input-grp input::placeholder { color: #9ca3af; font-weight: 500; font-size: 0.85rem;}
        .input-grp input:focus { box-shadow: 0 0 0 3px rgba(64,152,89,0.15); border-color: rgba(64,152,89,0.4); }

        .options-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.85rem; margin: 0.2rem 0.5rem 1.2rem;
        }
        .options-row label {
          display: flex; align-items: center; gap: 8px; color: #4b5563; font-weight: 500; cursor: pointer;
        }
        .options-row input[type="checkbox"] { accent-color: #409859; width: 16px; height: 16px; }
        .options-row a {
          color: #164022; text-decoration: none; font-weight: 600;
          transition: color 0.2s;
        }
        .options-row a:hover {
          color: #409859;
        }
        
        .btn-main {
          width: 100%;
          padding: 0.95rem;
          background: #164022;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(22,64,34,0.25);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(22,64,34,0.35);
          background: #1c522b;
        }
        .btn-main:disabled {
          background: #9ca3af;
          transform: none;
          box-shadow: none;
          cursor: not-allowed;
        }

        .btn-secondary {
          width: 100%;
          padding: 0.95rem;
          background: transparent;
          color: #164022;
          border: 1.5px solid #164022;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.8rem;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #f0fdf4;
        }

        @media(max-width: 900px) {
          .auth-wrapper { flex-direction: column; height: auto; min-height: 100vh; margin: 0; border-radius: 0; box-shadow: none; }
          .left-panel { padding: 4rem 2rem; flex: none; text-align: center; border-radius: 0; min-height: 35vh; }
          .arc-dark, .arc-light { display: none; }
          .footer-note { display: none; }
          .right-panel { padding: 3rem 1.5rem; border-radius: 0; min-height: 65vh; align-items: flex-start; }
          .glass-card { width: 100%; max-width: 100%; margin: 0 auto; padding: 2rem 1.5rem; }
          .back-btn { top: 1rem; left: 1rem; padding: 6px 12px; font-size: 0.85rem; }
        }
      `}</style>
      
      <div className="auth-wrapper">
        <Link to="/" className="back-btn">
          <ArrowLeft size={18} /> Accueil
        </Link>

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-start' }} className="mobile-center-logo">
            <LogoDembeni size="md" theme="dark" withText={true} />
          </div>
          
          <motion.div 
            className="left-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1>Bienvenue<br/>de retour</h1>
            <p>Accédez à votre espace citoyen 100% en ligne et suivez l'avancement de vos démarches.</p>
          </motion.div>

          <div className="footer-note">© {new Date().getFullYear()} Mairie de Dembéni</div>

          <div className="arc-dark"></div>
          <div className="arc-light"></div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="mesh-bg"></div>

          <motion.div 
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Connectez-vous pour<br/>continuer</h2>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '1.2rem' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #FCA5A5', fontWeight: '500' }}>
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin}>
              <div className="input-grp">
                <input type="email" placeholder="Adresse Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-grp">
                <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="options-row">
                <label><input type="checkbox" /> Se souvenir de moi</label>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" className="btn-main" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Connexion en cours...
                  </>
                ) : 'SE CONNECTER'}
              </button>
              
              <button type="button" className="btn-secondary" onClick={() => navigate('/inscription')}>
                CRÉER UN COMPTE CITOYEN
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
