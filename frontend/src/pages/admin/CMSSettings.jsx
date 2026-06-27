import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaCog, FaPhone, FaMapMarkerAlt, FaClock, FaShieldAlt } from 'react-icons/fa';

const CMSSettings = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    siteName: 'Commune de Dembéni',
    siteDescription: 'Portail administratif',
    contactEmail: '',
    contactPhone: '',
    contactPhone2: '',
    address: '',
    openingHours: [],
    socialNetworks: [],
    footerText: '',
    footerLinks: [],
    maintenanceMode: false,
    maintenanceMessage: '',
    emailNotificationsEnabled: true,
    mapLatitude: -12.8427,
    mapLongitude: 45.1970,
    mapUrl: '',
    mapMarkerTitle: '',
    mapMarkerDescription: ''
  });

  const fetchSettings = async () => {
    try {
      const response = await api.get('/cms/settings');
      setSettings(response.data || {});
    } catch (error) {
      setMessage('Erreur lors du chargement des paramètres: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/cms/settings', settings);
      setMessage('Paramètres sauvegardés avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: '2rem' }}>Chargement...</div></AdminLayout>;

  return (
    <AdminLayout onLogout={logout}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ marginBottom: '2rem', color: '#164022' }}>
          <FaCog style={{ marginRight: '10px' }} /> Paramètres du site
        </h1>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: message.includes('Erreur') ? '#FEE' : '#EFE',
            color: message.includes('Erreur') ? '#C33' : '#3C3'
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['basic', 'contact', 'hours', 'social', 'maintenance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab ? '#164022' : '#f0f0f0',
                color: activeTab === tab ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal'
              }}
            >
              {tab === 'basic' && 'Basique'}
              {tab === 'contact' && 'Contact'}
              {tab === 'hours' && 'Heures'}
              {tab === 'social' && 'Réseaux'}
              {tab === 'maintenance' && 'Maintenance'}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {activeTab === 'basic' && (
            <div>
              <h2>Informations de base</h2>
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du site</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description du site</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows="4"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.emailNotificationsEnabled}
                      onChange={(e) => handleInputChange('emailNotificationsEnabled', e.target.checked)}
                    />
                    Activer les notifications par email
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h2><FaPhone style={{ marginRight: '10px' }} />Informations de contact</h2>
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email principal</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Téléphone principal</label>
                  <input
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Téléphone secondaire</label>
                  <input
                    type="tel"
                    value={settings.contactPhone2}
                    onChange={(e) => handleInputChange('contactPhone2', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}><FaMapMarkerAlt style={{ marginRight: '8px' }} />Adresse</label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                
                <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '2rem 0' }} />
                <h3 style={{ color: '#164022', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMapMarkerAlt /> Carte Interactive Google Maps
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={settings.mapLatitude ?? -12.8427}
                      onChange={(e) => handleInputChange('mapLatitude', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={settings.mapLongitude ?? 45.1970}
                      onChange={(e) => handleInputChange('mapLongitude', e.target.value === '' ? '' : parseFloat(e.target.value))}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Google Maps URL (Itinéraire)</label>
                  <input
                    type="text"
                    value={settings.mapUrl || ''}
                    onChange={(e) => handleInputChange('mapUrl', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre du marqueur</label>
                  <input
                    type="text"
                    value={settings.mapMarkerTitle || ''}
                    onChange={(e) => handleInputChange('mapMarkerTitle', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    placeholder="Mairie de Dembéni"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description du marqueur</label>
                  <textarea
                    value={settings.mapMarkerDescription || ''}
                    onChange={(e) => handleInputChange('mapMarkerDescription', e.target.value)}
                    rows="3"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    placeholder="Adresse, Téléphone et Horaires..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div>
              <h2><FaShieldAlt style={{ marginRight: '10px' }} />Mode maintenance</h2>
              <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    />
                    Activer le mode maintenance
                  </label>
                </div>
                {settings.maintenanceMode && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message de maintenance</label>
                    <textarea
                      value={settings.maintenanceMessage}
                      onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                      rows="4"
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="success"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: '2rem' }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </motion.div>
    </AdminLayout>
  );
};

export default CMSSettings;
