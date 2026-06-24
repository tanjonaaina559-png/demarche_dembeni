import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaCalendar, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import ImageUpload from '../../components/ui/ImageUpload';

const CMSCollecteSchedule = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentSchedule, setCurrentSchedule] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    monthName: '',
    collectionDates: [],
    instructions: '',
    importantNotes: [],
    isPublished: true,
    displayOnHomepage: true
  });

  const monthNames = [
    '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/cms/collecte-schedules');
      setSchedules(response.data || []);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleInputChange = (field, value) => {
    setCurrentSchedule(prev => ({ ...prev, [field]: value }));
  };

  const openForm = (schedule = null) => {
    if (schedule) {
      setCurrentSchedule(schedule);
      setEditingId(schedule._id);
    } else {
      const now = new Date();
      setCurrentSchedule({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        monthName: monthNames[now.getMonth() + 1],
        collectionDates: [],
        instructions: '',
        importantNotes: [],
        isPublished: true,
        displayOnHomepage: true
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const addDate = () => {
    setCurrentSchedule(prev => ({
      ...prev,
      collectionDates: [...prev.collectionDates, { date: '', area: '', description: '', status: 'scheduled' }]
    }));
  };

  const updateDate = (index, field, value) => {
    const newDates = [...currentSchedule.collectionDates];
    newDates[index][field] = value;
    setCurrentSchedule(prev => ({ ...prev, collectionDates: newDates }));
  };

  const removeDate = (index) => {
    setCurrentSchedule(prev => ({
      ...prev,
      collectionDates: prev.collectionDates.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/cms/collecte-schedules/${editingId}`, currentSchedule);
        setMessage('Calendrier mis à jour avec succès');
      } else {
        await api.post('/cms/collecte-schedules', currentSchedule);
        setMessage('Calendrier créé avec succès');
      }
      closeForm();
      fetchSchedules();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce calendrier ?')) {
      try {
        await api.delete(`/cms/collecte-schedules/${id}`);
        setMessage('Calendrier supprimé avec succès');
        fetchSchedules();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Erreur: ' + error.message);
      }
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: '2rem' }}>Chargement...</div></AdminLayout>;

  return (
    <AdminLayout onLogout={logout}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#164022' }}>
            <FaCalendar style={{ marginRight: '10px' }} /> Calendrier de collecte d'encombrants
          </h1>
          <Button variant="primary" onClick={() => openForm()}>
            <FaPlus style={{ marginRight: '8px' }} /> Nouveau calendrier
          </Button>
        </div>

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

        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingId ? 'Modifier le calendrier' : 'Nouveau calendrier'}</h2>
                <button onClick={closeForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                  <FaTimes />
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Année</label>
                    <input
                      type="number"
                      value={currentSchedule.year}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      min={2020}
                      max={2050}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mois</label>
                    <select
                      value={currentSchedule.month}
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setCurrentSchedule(prev => ({
                          ...prev,
                          month: m,
                          monthName: monthNames[m]
                        }));
                      }}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                    >
                      {monthNames.map((name, idx) => idx > 0 && <option key={idx} value={idx}>{name}</option>)}
                    </select>
                  </div>
                </div>

                <ImageUpload
                  label="Image d'illustration (Affiche)"
                  value={currentSchedule.imageUrl || currentSchedule.posterImage}
                  onChange={(url) => { handleInputChange('imageUrl', url); handleInputChange('posterImage', url); }}
                />

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Instructions</label>
                  <textarea
                    value={currentSchedule.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Instructions pour les citoyens..."
                    rows="3"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentSchedule.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                    />
                    Publié
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentSchedule.displayOnHomepage}
                      onChange={(e) => handleInputChange('displayOnHomepage', e.target.checked)}
                    />
                    Afficher sur la page d'accueil
                  </label>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Dates de collecte</h3>
                    <Button variant="secondary" size="small" onClick={addDate}>
                      <FaPlus /> Ajouter date
                    </Button>
                  </div>

                  {currentSchedule.collectionDates && currentSchedule.collectionDates.map((date, idx) => (
                    <div key={idx} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <input
                          type="date"
                          value={date.date}
                          onChange={(e) => updateDate(idx, 'date', e.target.value)}
                          style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                        />
                        <input
                          type="text"
                          value={date.area}
                          onChange={(e) => updateDate(idx, 'area', e.target.value)}
                          placeholder="Quartier/Zone"
                          style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                        />
                      </div>
                      <textarea
                        value={date.description}
                        onChange={(e) => updateDate(idx, 'description', e.target.value)}
                        placeholder="Description (optionnel)"
                        rows="2"
                        style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={() => removeDate(idx)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#fee',
                          color: '#c33',
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash /> Supprimer
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={closeForm}>Annuler</Button>
                  <Button variant="success" onClick={handleSave}>{editingId ? 'Mettre à jour' : 'Créer'}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1rem' }}>
          {schedules.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#666'
            }}>
              Aucun calendrier créé. Commencez par en ajouter un !
            </div>
          ) : (
            schedules.map(schedule => (
              <motion.div
                key={schedule._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, color: '#164022' }}>
                        {monthNames[schedule.month]} {schedule.year}
                      </h3>
                      {!schedule.isPublished && (
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          backgroundColor: '#fee',
                          color: '#c33',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          Non publié
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#666', margin: '0.5rem 0' }}>
                      {schedule.collectionDates.length} date(s) de collecte
                    </p>
                    {schedule.instructions && (
                      <p style={{ color: '#666', fontSize: '0.95rem', margin: '0.5rem 0' }}>
                        {schedule.instructions.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openForm(schedule)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#e7f5ff',
                        color: '#0066cc',
                        cursor: 'pointer'
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#fee',
                        color: '#c33',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default CMSCollecteSchedule;
