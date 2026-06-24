import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaLandmark, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import ImageUpload from '../../components/ui/ImageUpload';

const CMSServicePublic = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [section, setSection] = useState({
    tagText: 'Proximité',
    tagIcon: 'fa-landmark',
    title: 'Service public de proximité',
    description: '',
    image: '',
    imageAlt: '',
    stats: [],
    buttonText: 'Voir tous les services',
    buttonLink: '/service-public',
    isActive: true
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/cms/service-public');
      setSection(res.data || {});
    } catch (error) {
      setMessage('Erreur lors du chargement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (field, value) => {
    setSection(prev => ({ ...prev, [field]: value }));
  };

  const addStat = () => {
    setSection(prev => ({
      ...prev,
      stats: [...(prev.stats || []), { value: '', label: '' }]
    }));
  };

  const updateStat = (index, field, value) => {
    const updated = [...(section.stats || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSection(prev => ({ ...prev, stats: updated }));
  };

  const removeStat = (index) => {
    setSection(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/cms/service-public', section);
      setMessage('Section mise à jour avec succès ✓');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: '2rem' }}>Chargement...</div></AdminLayout>;

  const cardStyle = { background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#374140' };
  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.9rem' };

  return (
    <AdminLayout onLogout={logout}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ marginBottom: '2rem', color: '#164022', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaLandmark /> Gestion — Service Public de Proximité
        </h1>

        {message && (
          <div style={{
            padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
            backgroundColor: message.includes('Erreur') ? '#FEE2E2' : '#DCFCE7',
            color: message.includes('Erreur') ? '#991B1B' : '#166534'
          }}>{message}</div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Content */}
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '1.5rem', color: '#164022' }}>Contenu principal</h2>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Tag texte</label>
                  <input style={inputStyle} value={section.tagText || ''} onChange={e => handleChange('tagText', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Tag icône (FontAwesome)</label>
                  <input style={inputStyle} value={section.tagIcon || ''} onChange={e => handleChange('tagIcon', e.target.value)} placeholder="fa-landmark" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Titre</label>
                <input style={inputStyle} value={section.title || ''} onChange={e => handleChange('title', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows="3" value={section.description || ''} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <ImageUpload
                label="Image du service public"
                value={section.imageUrl || section.image}
                onChange={(url) => { handleChange('imageUrl', url); handleChange('image', url); }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '-1rem' }}>
                <div>
                  <label style={labelStyle}>Alt de l'image</label>
                  <input style={inputStyle} value={section.imageAlt || ''} onChange={e => handleChange('imageAlt', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Texte du bouton</label>
                  <input style={inputStyle} value={section.buttonText || ''} onChange={e => handleChange('buttonText', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Lien du bouton</label>
                  <input style={inputStyle} value={section.buttonLink || ''} onChange={e => handleChange('buttonLink', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#164022' }}>Statistiques</h2>
              <Button variant="primary" onClick={addStat}><FaPlus style={{ marginRight: '6px' }} /> Ajouter</Button>
            </div>
            {(section.stats || []).map((stat, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '0.75rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                <input style={inputStyle} value={stat.value} onChange={e => updateStat(idx, 'value', e.target.value)} placeholder="Valeur (ex: 98%)" />
                <input style={inputStyle} value={stat.label} onChange={e => updateStat(idx, 'label', e.target.value)} placeholder="Label (ex: Satisfaction)" />
                <button onClick={() => removeStat(idx)} style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#FEE2E2', color: '#991B1B', cursor: 'pointer' }}><FaTrash /></button>
              </div>
            ))}
            {(!section.stats || section.stats.length === 0) && <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune statistique. Les valeurs par défaut seront utilisées.</p>}
          </div>
        </div>

        <Button variant="success" onClick={handleSave} disabled={saving} style={{ marginTop: '1.5rem' }}>
          <FaSave style={{ marginRight: '8px' }} /> {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </motion.div>
    </AdminLayout>
  );
};

export default CMSServicePublic;
