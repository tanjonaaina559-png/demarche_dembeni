import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import Toast from '../../components/ui/Toast';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, Camera, Save, CreditCard, MapPin, 
  Phone, Calendar, Mail, Lock, Key, Shield, 
  User, Edit3, CheckCircle, ArrowLeft
} from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';
import './CitizenProfile.css';

const CitizenProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [profileData, setProfileData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [previewPic, setPreviewPic] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);
  const fileInputRef = useRef();

  useEffect(() => {
    if (user) {
      setProfileData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setProfilePicture(user.profilePicture || null);
    }
  }, [user]);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('firstname', profileData.firstname);
      formData.append('lastname', profileData.lastname);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      if (profilePicture instanceof File) {
        formData.append('profilePicture', profilePicture);
      }
      const { data } = await api.put('/users/profile', formData);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      showToast('Profil mis à jour avec succès ✓');
    } catch (error) {
      showToast('Erreur lors de la mise à jour du profil', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast('Les mots de passe ne correspondent pas', 'error');
    }
    if (passwords.newPassword.length < 6) {
      return showToast('Le nouveau mot de passe doit contenir au moins 6 caractères', 'error');
    }
    setIsPasswordUpdating(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      showToast('Mot de passe mis à jour avec succès ✓');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  if (!user) return <Loader />;

  const avatarDisplay = previewPic || (user?.profilePicture ? getImageUrl(user.profilePicture) : null);

  return (
    <div className="profile-container">
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />

      {/* Header */}
      <div className="profile-header">
        <Link to="/citizen/dashboard" className="profile-back-link">
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>
        <div>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et paramètres de sécurité.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Sidebar Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="profile-sidebar-card">
          <div className="avatar-wrapper">
            <div className="avatar-circle">
              {avatarDisplay ? (
                <img src={avatarDisplay} alt="Profil" />
              ) : (
                <UserCircle size={56} />
              )}
            </div>
            <button
              type="button"
              className="avatar-edit-btn"
              onClick={() => fileInputRef.current.click()}
              title="Changer la photo"
            >
              <Camera size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePicChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-sidebar-name">
            {user.firstname} {user.lastname}
          </div>
          <div className="profile-sidebar-email">{user.email}</div>
          <div className="profile-sidebar-badge">
            <CheckCircle size={14} />
            Compte vérifié
          </div>

          <nav className="profile-sidebar-nav">
            <button
              onClick={() => setActiveTab('profile')}
              className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <User size={18} /> Informations personnelles
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`profile-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            >
              <Shield size={18} /> Sécurité
            </button>
          </nav>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="profile-main-card">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="profile-section-header">
                  <Edit3 size={20} />
                  <h2>Informations personnelles</h2>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  <div className="profile-form-grid">
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.firstname}
                        onChange={e => setProfileData({ ...profileData, firstname: e.target.value })}
                        required
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nom de famille</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.lastname}
                        onChange={e => setProfileData({ ...profileData, lastname: e.target.value })}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Mail size={14} /> Email (lecture seule)</label>
                      <input type="email" className="form-input form-input-disabled" value={user.email} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Phone size={14} /> Téléphone</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.phone}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+262 06 XX XX XX"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><CreditCard size={14} /> N° CNI (lecture seule)</label>
                      <input type="text" className="form-input form-input-disabled" value={user.CIN || 'Non renseigné'} disabled />
                    </div>
                    <div className="form-group">
                      <label className="form-label"><Calendar size={14} /> Date de naissance</label>
                      <input
                        type="text"
                        className="form-input form-input-disabled"
                        value={user.dateNaissance ? new Date(user.dateNaissance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                        disabled
                      />
                    </div>
                    <div className="form-group form-group-full">
                      <label className="form-label"><MapPin size={14} /> Adresse complète</label>
                      <input
                        type="text"
                        className="form-input"
                        value={profileData.address}
                        onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Numéro, rue, ville..."
                      />
                    </div>
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn btn-primary profile-save-btn" disabled={isUpdating}>
                      {isUpdating ? <Loader size={20} color="white" /> : <Save size={18} />}
                      {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="profile-section-header">
                  <Shield size={20} />
                  <h2>Sécurité et Mot de passe</h2>
                </div>
                <p className="profile-section-desc">Mettez à jour votre mot de passe pour sécuriser votre accès.</p>

                <form onSubmit={handlePasswordSubmit} className="security-form">
                  <div className="security-notice">
                    <Lock size={18} />
                    <div>
                      <strong>Conseils de sécurité</strong>
                      <p>Utilisez au moins 8 caractères, un chiffre et un symbole pour un mot de passe solide.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label"><Key size={14} /> Mot de passe actuel</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.currentPassword}
                      onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                      placeholder="Votre mot de passe actuel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Lock size={14} /> Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.newPassword}
                      onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      placeholder="Minimum 6 caractères"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Lock size={14} /> Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                      placeholder="Répétez le nouveau mot de passe"
                    />
                  </div>

                  <div className="profile-form-actions">
                    <button type="submit" className="btn btn-primary profile-save-btn" disabled={isPasswordUpdating}>
                      {isPasswordUpdating ? <Loader size={20} color="white" /> : <Shield size={18} />}
                      {isPasswordUpdating ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CitizenProfile;
