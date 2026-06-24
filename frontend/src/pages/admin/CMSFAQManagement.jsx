import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaQuestion, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const CMSFAQManagement = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentFAQ, setCurrentFAQ] = useState({
    category: '',
    question: '',
    answer: '',
    tags: [],
    isActive: true
  });

  const fetchFAQs = async () => {
    try {
      const response = await api.get('/cms/faqs');
      setFaqs(response.data || []);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleInputChange = (field, value) => {
    setCurrentFAQ(prev => ({ ...prev, [field]: value }));
  };

  const openForm = (faq = null) => {
    if (faq) {
      setCurrentFAQ(faq);
      setEditingId(faq._id);
    } else {
      setCurrentFAQ({ category: '', question: '', answer: '', tags: [], isActive: true });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCurrentFAQ({ category: '', question: '', answer: '', tags: [], isActive: true });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.put(`/cms/faqs/${editingId}`, currentFAQ);
        setMessage('FAQ mise à jour avec succès');
      } else {
        await api.post('/cms/faqs', currentFAQ);
        setMessage('FAQ créée avec succès');
      }
      closeForm();
      fetchFAQs();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette FAQ ?')) {
      try {
        await api.delete(`/cms/faqs/${id}`);
        setMessage('FAQ supprimée avec succès');
        fetchFAQs();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Erreur: ' + error.message);
      }
    }
  };

  const toggleActive = async (faq) => {
    try {
      await api.put(`/cms/faqs/${faq._id}`, { ...faq, isActive: !faq.isActive });
      fetchFAQs();
    } catch (error) {
      setMessage('Erreur: ' + error.message);
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: '2rem' }}>Chargement...</div></AdminLayout>;

  return (
    <AdminLayout onLogout={logout}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#164022' }}>
            <FaQuestion style={{ marginRight: '10px' }} /> Gestion des FAQ
          </h1>
          <Button variant="primary" onClick={() => openForm()}>
            <FaPlus style={{ marginRight: '8px' }} /> Nouvelle FAQ
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
            zIndex: 1000
          }}>
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>{editingId ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</h2>
                <button onClick={closeForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                  <FaTimes />
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Catégorie</label>
                  <input
                    type="text"
                    value={currentFAQ.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="ex: Général, Citoyens, Services"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Question</label>
                  <textarea
                    value={currentFAQ.question}
                    onChange={(e) => handleInputChange('question', e.target.value)}
                    placeholder="Posez la question..."
                    rows="3"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Réponse</label>
                  <textarea
                    value={currentFAQ.answer}
                    onChange={(e) => handleInputChange('answer', e.target.value)}
                    placeholder="Fournissez la réponse détaillée..."
                    rows="5"
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={currentFAQ.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                    Actif
                  </label>
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
          {faqs.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#666'
            }}>
              Aucune FAQ créée. Commencez par en ajouter une !
            </div>
          ) : (
            faqs.map(faq => (
              <motion.div
                key={faq._id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.3rem 0.8rem',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>
                        {faq.category}
                      </span>
                      {!faq.isActive && (
                        <span style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.8rem',
                          backgroundColor: '#fee',
                          color: '#c33',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}>
                          Inactif
                        </span>
                      )}
                    </div>
                    <h3 style={{ margin: '0.5rem 0', color: '#164022' }}>{faq.question}</h3>
                    <p style={{ color: '#666', fontSize: '0.95rem', margin: '0.5rem 0 0 0' }}>{faq.answer.substring(0, 100)}...</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openForm(faq)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#e7f5ff',
                        color: '#0066cc',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#fee',
                        color: '#c33',
                        cursor: 'pointer',
                        fontWeight: 600
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

export default CMSFAQManagement;
