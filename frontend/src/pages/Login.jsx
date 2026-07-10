import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
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

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultPath = user.role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard';
      const redirectPath = location.state?.from || defaultPath;
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'citizen' && data.status === 'approved') {
        const redirectPath = location.state?.from || '/citizen/dashboard';
        navigate(redirectPath);
      } else if (data.role === 'citizen' && data.status === 'pending') {
        setError('Votre compte est en attente de validation par l\'administration.');
      } else if (data.role === 'citizen' && data.status === 'rejected') {
        setError('Votre compte a été refusé. Veuillez contacter l\'administration.');
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de la connexion';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
          box-shadow: 0 15px 45px rgba(0,0,0,0.06);
          position: relative;
          margin: 2rem;
          background: #fff;
          overflow: hidden;
        }

        .left-panel {
          flex: 1;
          background: #eef5ef;
          position: relative;
          padding: 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 10;
          border-radius: 20px 0 0 20px;
        }
        
        .logo {
          position: absolute;
          top: 2rem; left: 3rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 800;
          font-size: 1.1rem;
          color: #174224;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 10px;
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
          font-size: 0.9rem;
          color: #555;
          font-weight: 500;
        }
        
        .left-content p a {
          color: #d13030;
          text-decoration: none;
          font-weight: 600;
          margin-left: 4px;
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
          max-width: 380px;
          padding: 2.5rem 2rem;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        .glass-card h2 {
          font-family: 'Poppins', sans-serif;
          text-align: center;
          color: #164022;
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          padding: 0 1rem;
          line-height: 1.4;
        }

        .input-grp { width: 100%; margin-bottom: 1rem; position: relative; }
        .input-grp input {
          width: 100%;
          padding: 0.85rem 2.5rem 0.85rem 1.2rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.3s;
          color: #333;
        }
        .input-grp input::placeholder { color: #828a9b; font-weight: 500; font-size: 0.8rem;}
        .input-grp input:focus { box-shadow: 0 0 0 3px rgba(64,152,89,0.15); border-color: rgba(64,152,89,0.3); }

        .options-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.8rem; margin: 0.2rem 0.5rem 0.8rem;
        }
        .options-row label {
          display: flex; align-items: center; gap: 8px; color: #333; font-weight: 600; cursor: pointer;
        }
        .options-row input[type="checkbox"] { accent-color: #409859; }
        .options-row a {
          color: #d13030; text-decoration: none; font-weight: 700;
        }
        
        .btn-main {
          width: 100%;
          padding: 0.85rem;
          background: #409859;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(64,152,89,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-main:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(64,152,89,0.35);
        }

        .btn-secondary {
          width: 100%;
          padding: 0.85rem;
          background: #ffffff;
          color: #409859;
          border: 1px solid #409859;
          border-radius: 12px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #f0f9f4;
        }

        @media(max-width: 900px) {
          .auth-wrapper { flex-direction: column; height: auto; min-height: 100vh; margin: 0; border-radius: 0; box-shadow: none; }
          .left-panel { padding: 3rem 2rem; flex: none; text-align: center; border-radius: 0; min-height: 30vh; }
          .arc-dark, .arc-light { display: none; }
          .logo { position: relative; top: 0; left: 0; margin-bottom: 1.5rem; justify-content: center; }
          .footer-note { display: none; }
          .right-panel { padding: 3rem 1.5rem; border-radius: 0; min-height: 70vh; align-items: flex-start; }
          .glass-card { width: 100%; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
      <div className="auth-wrapper">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="logo" style={{ textDecoration: 'none' }}>
            <LogoDembeni size="md" theme="dark" withText={true} />
          </div>
          
          <div className="left-content">
            <h1>Bienvenue<br/>de retour</h1>
            <p>Accédez à votre espace citoyen 100% en ligne.</p>
          </div>

          <div className="footer-note">© {new Date().getFullYear()} Mairie de Dembeni</div>

          <div className="arc-dark"></div>
          <div className="arc-light"></div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="mesh-bg"></div>

          <div className="glass-card">
            <h2>Connectez-vous pour<br/>continuer</h2>
            {error && <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid #FCA5A5' }}>{error}</div>}
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
                <label><input type="checkbox" /> Se souvenir</label>
                <Link to="/forgot-password">Mot de passe oublié ?</Link>
              </div>

              <button type="submit" className="btn-main" disabled={loading}>
                {loading ? 'CONNEXION...' : 'SE CONNECTER'}
              </button>
              
              <button type="button" className="btn-secondary" onClick={() => navigate('/inscription')}>
                CRÉER UN COMPTE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
