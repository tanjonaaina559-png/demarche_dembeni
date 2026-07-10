import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import LogoDembeni from '../components/ui/LogoDembeni';

const Inscription = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    CIN: '',
    dateNaissance: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error when user types
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    if (!regex.test(formData.password)) {
      return setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      
      setSuccess(response.message || 'Inscription réussie ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMsg = err.message || 'Erreur lors de l\'inscription';
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
          max-width: 950px;
          min-height: 550px;
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
          flex: 1.2;
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
          max-width: 440px;
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

        .input-grp { width: 100%; margin-bottom: 0.8rem; position: relative; }
        .input-grp input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          background: #ffffff;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          outline: none;
          transition: all 0.3s;
          color: #333;
        }
        .input-grp input::placeholder { color: #828a9b; font-weight: 500; font-size: 0.8rem;}
        .input-grp input:focus { box-shadow: 0 0 0 3px rgba(64,152,89,0.15); border-color: rgba(64,152,89,0.3); }

        .options-row {
          display: flex; justify-content: flex-start; align-items: center;
          font-size: 0.8rem; margin: 0.2rem 0.5rem 0.8rem;
        }
        .options-row label {
          display: flex; align-items: center; gap: 8px; color: #333; font-weight: 600; cursor: pointer;
        }
        .options-row input[type="checkbox"] { accent-color: #409859; }
        
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

        .divider {
          text-align: center;
          margin: 1.2rem 0;
          position: relative;
        }
        .divider::before, .divider::after {
          content: '';
          position: absolute;
          top: 50%; width: 20%; height: 1px;
          background: rgba(0,0,0,0.1);
        }
        .divider::before { left: 10%; }
        .divider::after { right: 10%; }
        .divider span {
          font-size: 0.72rem; color: #555; font-weight: 500; padding: 0 10px;
        }

        .btn-google {
          width: 100%;
          padding: 0.85rem;
          background: #ffffff;
          color: #333;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .btn-google:hover {
          background: #fdfdfd;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
        }

        /* Password Strength */
        .password-strength {
          height: 4px;
          border-radius: 4px;
          background: #e5e7eb;
          margin-top: -6px;
          margin-bottom: 0.8rem;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          overflow: hidden;
          position: relative;
        }
        .password-strength-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
        .strength-text {
          font-size: 0.7rem;
          font-weight: 600;
          text-align: right;
          margin-top: -10px;
          margin-bottom: 0.8rem;
          margin-right: 0.5rem;
        }

        @media(max-width: 900px) {
          .auth-wrapper { flex-direction: column; height: auto; min-height: 100vh; margin: 0; border-radius: 0; box-shadow: none; }
          .left-panel { padding: 3rem 2rem; flex: none; text-align: center; border-radius: 0; min-height: 25vh; }
          .arc-dark, .arc-light { display: none; }
          .logo { position: relative; top: 0; left: 0; margin-bottom: 1.5rem; justify-content: center; }
          .footer-note { display: none; }
          .right-panel { padding: 3rem 1.5rem; border-radius: 0; min-height: 75vh; align-items: flex-start; }
          .glass-card { width: 100%; max-width: 440px; margin: 0 auto; }
        }
      `}</style>
      <div className="auth-wrapper">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="logo" style={{ textDecoration: 'none' }}>
            <LogoDembeni size="md" theme="dark" withText={true} />
          </div>
          
          <div className="left-content">
            <h1>Créer un<br/>compte</h1>
            <p>Déjà citoyen ? <Link to="/login">Se connecter ici</Link></p>
          </div>

          <div className="footer-note">© {new Date().getFullYear()} Mairie de Dembeni</div>

          <div className="arc-dark"></div>
          <div className="arc-light"></div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="mesh-bg"></div>

          <div className="glass-card">
            <h2>Commencez votre<br/>inscription</h2>
            {error && <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid #FCA5A5' }}>{error}</div>}
            {success && <div style={{ color: '#059669', background: '#D1FAE5', padding: '10px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', border: '1px solid #A7F3D0' }}>{success}</div>}
            <form onSubmit={handleRegister}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-grp">
                  <input type="text" id="firstname" placeholder="Prénom" required value={formData.firstname} onChange={handleChange} />
                </div>
                <div className="input-grp">
                  <input type="text" id="lastname" placeholder="Nom" required value={formData.lastname} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-grp">
                  <input type="email" id="email" placeholder="Adresse Email" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="input-grp">
                  <input type="tel" id="phone" placeholder="Téléphone" pattern="[0-9]*" maxLength={20} required value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-grp">
                  <input type="text" id="CIN" placeholder="Numéro CIN" required value={formData.CIN} onChange={handleChange} />
                </div>
                <div className="input-grp">
                  <input type="date" id="dateNaissance" required value={formData.dateNaissance} onChange={handleChange} title="Date de naissance" style={{ color: formData.dateNaissance ? '#333' : '#828a9b' }} />
                </div>
              </div>
              <div className="input-grp">
                <input type="text" id="address" placeholder="Adresse complète" required value={formData.address} onChange={handleChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-grp">
                  <input type={showPassword ? "text" : "password"} id="password" placeholder="Mot de passe" required value={formData.password} onChange={handleChange} />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="input-grp">
                  <input type={showConfirm ? "text" : "password"} id="confirmPassword" placeholder="Confirmer le mot de passe" required value={formData.confirmPassword} onChange={handleChange} />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password.length > 0 && (() => {
                let strength = 0;
                if (formData.password.length >= 6) strength += 1;
                if (formData.password.length >= 10) strength += 1;
                if (/[A-Z]/.test(formData.password)) strength += 1;
                if (/[0-9!@#$%^&*]/.test(formData.password)) strength += 1;
                
                const colors = ['#EF4444', '#F59E0B', '#10B981', '#059669'];
                const labels = ['Faible', 'Moyen', 'Bon', 'Fort'];
                const pct = strength === 0 ? 15 : strength * 25;
                const color = colors[Math.max(0, strength - 1)];

                return (
                  <>
                    <div className="password-strength">
                      <div className="password-strength-bar" style={{ width: `${pct}%`, background: color }}></div>
                    </div>
                    <div className="strength-text" style={{ color }}>{labels[Math.max(0, strength - 1)]}</div>
                  </>
                );
              })()}

              <div className="options-row">
                <label><input type="checkbox" required /> J'accepte les conditions d'utilisation</label>
              </div>

              <button type="submit" className="btn-main" disabled={loading}>
                {loading ? 'INSCRIPTION EN COURS...' : 'S\'INSCRIRE'}
              </button>
              
              <div className="divider">
                <span>Ou s'inscrire avec</span>
              </div>

              <button type="button" className="btn-google">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                S'inscrire avec Google
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
