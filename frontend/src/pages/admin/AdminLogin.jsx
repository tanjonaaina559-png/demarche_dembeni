import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role !== 'admin') {
        setError('Accès refusé. Réservé aux administrateurs.');
        setLoading(false);
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Identifiants incorrects. Veuillez réessayer.');
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

        .access-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FEF2F2; color: #DC2626;
          font-size: .7rem; font-weight: 700;
          padding: .35rem .8rem; border-radius: 50px;
          text-transform: uppercase; letter-spacing: .5px;
          margin-bottom: 1.2rem;
          border: 1px solid #FCA5A5;
          margin-left: auto;
          margin-right: auto;
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

        .input-grp { width: 100%; margin-bottom: 1rem; }
        .input-grp input {
          width: 100%;
          padding: 0.85rem 1.2rem;
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

        .default-creds {
          background: rgba(240, 249, 244, 0.8);
          border: 1px solid rgba(198, 240, 212, 0.8);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.8rem;
          color: #0D734C;
        }

        .default-creds strong {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.8rem;
          color: #18A571;
        }

        .default-creds .cred-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        @media(max-width: 900px) {
          .auth-wrapper { flex-direction: column; height: auto; min-height: 100vh; margin: 0; border-radius: 0; box-shadow: none; }
          .left-panel { padding: 3rem 2rem; flex: none; text-align: center; border-radius: 0; min-height: 35vh; }
          .arc-dark, .arc-light { display: none; }
          .logo { position: relative; top: 0; left: 0; margin-bottom: 1.5rem; justify-content: center; }
          .footer-note { display: none; }
          .right-panel { padding: 3rem 1.5rem; border-radius: 0; min-height: 65vh; align-items: flex-start; }
          .glass-card { width: 100%; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
      <div className="auth-wrapper">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <span>DEMBENI</span>
          </Link>
          
          <div className="left-content">
            <h1>Espace<br/>Administration</h1>
            <p><i className="fas fa-lock" style={{ marginRight: '8px' }}></i> Accès restreint aux agents municipaux</p>
          </div>

          <div className="footer-note">© {new Date().getFullYear()} Admin Dembeni</div>

          <div className="arc-dark"></div>
          <div className="arc-light"></div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="mesh-bg"></div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ textAlign: 'center' }}>
              <span className="access-badge"><i className="fas fa-shield-alt"></i> Administration</span>
            </div>
            <h2>Connexion au<br/>Tableau de bord</h2>
            
            <div className="default-creds">
              <strong><i className="fas fa-info-circle"></i> Identifiants par défaut</strong>
              <div className="cred-line">
                <span>Email:</span>
                <span style={{ fontWeight: 600 }}>dembenimairie@gmail.com</span>
              </div>
              <div className="cred-line">
                <span>Password:</span>
                <span style={{ fontWeight: 600 }}>dembeni123</span>
              </div>
            </div>

            {error && <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid #FCA5A5' }}>{error}</div>}
            
            <form onSubmit={handleLogin}>
              <div className="input-grp">
                <input type="email" placeholder="Adresse Email Admin" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="input-grp">
                <input type="password" placeholder="Mot de passe" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <button type="submit" className="btn-main" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'CONNEXION EN COURS...' : 'ACCÉDER AU DASHBOARD'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
