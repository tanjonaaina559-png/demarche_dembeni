import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaImage, FaTrash, FaPlus } from 'react-icons/fa';
import ImageUpload from '../../components/ui/ImageUpload';

const CMSHeroSection = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [hero, setHero] = useState({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    buttons: [],
    stats: [],
    showStats: true,
    showServices: true,
    showContactInfo: true,
    showAlert: true,
    alertText: '',
    alertType: 'info'
  });

  const fetchHero = async () => {
    try {
      const response = await api.get('/cms/hero');
      setHero(response.data || {});
    } catch (error) {
      setMessage('Erreur lors du chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleInputChange = (field, value) => {
    setHero(prev => ({ ...prev, [field]: value }));
  };

  const addButton = () => {
    setHero(prev => ({
      ...prev,
      buttons: [...prev.buttons, { text: 'Nouveau bouton', link: '/', color: '#007bff', order: prev.buttons.length }]
    }));
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...hero.buttons];
    newButtons[index][field] = value;
    setHero(prev => ({ ...prev, buttons: newButtons }));
  };

  const removeButton = (index) => {
    setHero(prev => ({ ...prev, buttons: prev.buttons.filter((_, i) => i !== index) }));
  };

  const addStat = () => {
    setHero(prev => ({
      ...prev,
      stats: [...prev.stats, { value: '', label: '', icon: '' }]
    }));
  };

  const updateStat = (index, field, value) => {
    const newStats = [...hero.stats];
    newStats[index][field] = value;
    setHero(prev => ({ ...prev, stats: newStats }));
  };

  const removeStat = (index) => {
    setHero(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cms/hero', hero);
      setMessage('Section héro mise à jour avec succès');
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
          <FaImage style={{ marginRight: '10px' }} /> Gestion de la section héro
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

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Main Content */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2>Contenu principal</h2>
            
            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre principal</label>
                <input
                  type="text"
                  value={hero.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Toutes vos démarches en un seul endroit"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sous-titre</label>
                <input
                  type="text"
                  value={hero.subtitle}
                  onChange={(e) => handleInputChange('subtitle', e.target.value)}
                  placeholder="État civil, documents officiels, collecte d'encombrants, crèche..."
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                <textarea
                  value={hero.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <ImageUpload
                label="Image de fond (Hero)"
                value={hero.imageUrl || hero.backgroundImage}
                onChange={(url) => { handleInputChange('imageUrl', url); handleInputChange('backgroundImage', url); }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Boutons d'action</h2>
              <Button variant="primary" onClick={addButton}>
                <FaPlus style={{ marginRight: '8px' }} /> Ajouter un bouton
              </Button>
            </div>

            {hero.buttons && hero.buttons.map((btn, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                <input
                  type="text"
                  value={btn.text}
                  onChange={(e) => updateButton(idx, 'text', e.target.value)}
                  placeholder="Texte du bouton"
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  value={btn.link}
                  onChange={(e) => updateButton(idx, 'link', e.target.value)}
                  placeholder="Lien"
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="color"
                  value={btn.color}
                  onChange={(e) => updateButton(idx, 'color', e.target.value)}
                  style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #ddd', height: '44px', cursor: 'pointer' }}
                />
                <button
                  onClick={() => removeButton(idx)}
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fee', color: '#c33', cursor: 'pointer' }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2>Statistiques</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={hero.showStats}
                    onChange={(e) => handleInputChange('showStats', e.target.checked)}
                  />
                  Afficher les statistiques
                </label>
              </div>
              <Button variant="primary" onClick={addStat}>
                <FaPlus style={{ marginRight: '8px' }} /> Ajouter une statistique
              </Button>
            </div>

            {hero.stats && hero.stats.map((stat, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateStat(idx, 'value', e.target.value)}
                  placeholder="Valeur (ex: 12+)"
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(idx, 'label', e.target.value)}
                  placeholder="Libellé (ex: Démarches)"
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <input
                  type="text"
                  value={stat.icon}
                  onChange={(e) => updateStat(idx, 'icon', e.target.value)}
                  placeholder="Icône Font Awesome (ex: fa-briefcase)"
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => removeStat(idx)}
                  style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fee', color: '#c33', cursor: 'pointer' }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {/* Alert */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                checked={hero.showAlert}
                onChange={(e) => handleInputChange('showAlert', e.target.checked)}
              />
              <h2>Afficher l'alerte globale</h2>
            </label>

            {hero.showAlert && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Texte de l'alerte</label>
                  <input
                    type="text"
                    value={hero.alertText}
                    onChange={(e) => handleInputChange('alertText', e.target.value)}
                    placeholder="Mairie ouverte du lundi au vendredi de 8h à 16h30"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type d'alerte</label>
                  <select
                    value={hero.alertType}
                    onChange={(e) => handleInputChange('alertType', e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  >
                    <option value="info">Information</option>
                    <option value="warning">Avertissement</option>
                    <option value="success">Succès</option>
                    <option value="danger">Danger</option>
                  </select>
                </div>
              </div>
            )}
          </div>
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

export default CMSHeroSection;
