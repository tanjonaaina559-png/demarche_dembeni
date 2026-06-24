import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import PortalModal from '../../components/ui/PortalModal';
import Toast from '../../components/ui/Toast';
import { ArrayEditor, StringListEditor } from '../../components/ui/ArrayEditor';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { FaHome, FaPlus, FaEdit, FaTrash, FaSave, FaArrowUp, FaArrowDown, FaEye, FaEyeSlash } from 'react-icons/fa';

const renderInput = (label, value, onChange, placeholder = '', isTextarea = false) => (
  <div style={{ marginBottom: '1rem' }}>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</label>
    {isTextarea ? (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows="4"
        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
      />
    )}
  </div>
);

const SectionContainer = ({ title, children, action }) => (
  <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
      <h2 style={{ color: '#164022', margin: 0 }}>{title}</h2>
      {action && action}
    </div>
    {children}
  </div>
);

// --- MODAL COMPONENTS FOR SECTIONS ---
const HeroModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier la section Héro">
      <ImageUpload label="Image de fond" value={local.backgroundImage || local.imageUrl || ''} onChange={url => { setField('backgroundImage', url); setField('imageUrl', url); }} />
      {renderInput('Titre', local.title, v => setField('title', v))}
      {renderInput('Sous-titre', local.subtitle, v => setField('subtitle', v))}
      {renderInput('Description', local.description, v => setField('description', v), '', true)}
      {renderInput('Titre des statistiques', local.servicesHeading, v => setField('servicesHeading', v))}
      
      <ArrayEditor label="Boutons" value={local.buttons} onChange={v => setField('buttons', v)} fields={[{key:'text', label:'Texte'}, {key:'link', label:'Lien'}]} addLabel="Ajouter bouton" />
      
      <div style={{ marginBottom: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
          <input type="checkbox" checked={local.showAlert !== false} onChange={e => setField('showAlert', e.target.checked)} />
          Afficher l'alerte
        </label>
        {local.showAlert !== false && <div style={{ marginTop: '1rem' }}>{renderInput("Texte de l'alerte", local.alertText, v => setField('alertText', v))}</div>}
      </div>

      <ArrayEditor label="Statistiques" value={local.statistics} onChange={v => setField('statistics', v)} fields={[{key:'value', label:'Valeur'}, {key:'label', label:'Libellé'}, {key:'icon', label:'Icône (fa-star)'}]} />

      <Button variant="success" onClick={() => onSave('hero', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

const CollecteModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier Collecte">
      <ImageUpload label="Image" value={local.imageUrl || local.posterImage || ''} onChange={url => { setField('imageUrl', url); setField('posterImage', url); }} />
      {renderInput('Description (Instructions)', local.instructions, v => setField('instructions', v), '', true)}
      {renderInput('Texte du bouton', local.buttonText, v => setField('buttonText', v))}
      {renderInput('Lien du bouton', local.buttonLink, v => setField('buttonLink', v))}
      <StringListEditor label="Avantages / Checklist" value={local.importantNotes} onChange={v => setField('importantNotes', v)} placeholder="Ex: 2 passages par mois" />
      <Button variant="success" onClick={() => onSave('collecte', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

const ServicesModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier Service public">
      <ImageUpload label="Image" value={local.imageUrl || local.backgroundImage || ''} onChange={url => { setField('imageUrl', url); setField('backgroundImage', url); }} />
      {renderInput('Titre', local.title, v => setField('title', v))}
      {renderInput('Tag (ex: Proximité)', local.tagText, v => setField('tagText', v))}
      {renderInput('Icône du Tag', local.tagIcon, v => setField('tagIcon', v))}
      {renderInput('Description', local.description, v => setField('description', v), '', true)}
      {renderInput('Texte du bouton', local.buttonText, v => setField('buttonText', v))}
      {renderInput('Lien du bouton', local.buttonLink, v => setField('buttonLink', v))}
      <ArrayEditor label="Statistiques" value={local.statistics} onChange={v => setField('statistics', v)} fields={[{key:'value', label:'Valeur'}, {key:'label', label:'Libellé'}]} />
      <Button variant="success" onClick={() => onSave('services', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

const EnfanceModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier Enfance et Loisirs">
      <ImageUpload label="Image" value={local.imageUrl || ''} onChange={url => setField('imageUrl', url)} />
      {renderInput('Titre principal', local.title, v => setField('title', v))}
      {renderInput('Tag', local.tagText, v => setField('tagText', v))}
      {renderInput('Icône du Tag', local.tagIcon, v => setField('tagIcon', v))}
      {renderInput('Titre Activités', local.activitiesTitle, v => setField('activitiesTitle', v))}
      {renderInput('Titre Tarifs', local.pricingTitle, v => setField('pricingTitle', v))}
      {renderInput('Note Tarifs', local.pricingNote, v => setField('pricingNote', v))}
      {renderInput('Texte du bouton', local.buttonText, v => setField('buttonText', v))}
      {renderInput('Lien du bouton', local.buttonLink, v => setField('buttonLink', v))}
      
      <ArrayEditor label="Activités" value={local.activities} onChange={v => setField('activities', v)} fields={[{key:'label', label:'Nom'}, {key:'icon', label:'Icône'}]} />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 600 }}>Tarifs</label>
        {(local.tarifs || []).map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '6px'}} value={t.label||''} onChange={e => {const c=[...local.tarifs]; c[i].label=e.target.value; setField('tarifs', c);}} placeholder="Label" />
            <input style={{width: '60px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px'}} value={t.price||''} onChange={e => {const c=[...local.tarifs]; c[i].price=e.target.value; setField('tarifs', c);}} placeholder="Prix" />
            <input style={{width: '60px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px'}} value={t.unit||''} onChange={e => {const c=[...local.tarifs]; c[i].unit=e.target.value; setField('tarifs', c);}} placeholder="Unité" />
            <label style={{fontSize:'0.8rem'}}><input type="checkbox" checked={t.isFeatured||false} onChange={e => {const c=[...local.tarifs]; c[i].isFeatured=e.target.checked; setField('tarifs', c);}} /> Vedette</label>
            <button onClick={()=>{const c=[...local.tarifs]; c.splice(i,1); setField('tarifs',c);}} style={{background:'red', color:'white', border:'none', borderRadius:'4px', padding:'8px'}}><FaTrash size={12}/></button>
          </div>
        ))}
        <button onClick={() => setField('tarifs', [...(local.tarifs||[]), {label:'', price:'', unit:'', isFeatured:false}])} style={{background:'#16A34A', color:'white', border:'none', padding:'6px 12px', borderRadius:'6px'}}><FaPlus size={10} /> Ajouter Tarif</button>
      </div>

      <Button variant="success" onClick={() => onSave('enfance', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

const PasseportModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier Passeport et CNI">
      {renderInput('Titre principal', local.title, v => setField('title', v))}
      {renderInput('Tag', local.tagText, v => setField('tagText', v))}
      {renderInput('Icône du Tag', local.tagIcon, v => setField('tagIcon', v))}
      {renderInput('Texte du bouton', local.buttonText, v => setField('buttonText', v))}
      {renderInput('Lien du bouton', local.buttonLink, v => setField('buttonLink', v))}
      
      <ArrayEditor label="Étapes" value={local.steps} onChange={v => setField('steps', v)} fields={[{key:'title', label:'Titre'}, {key:'description', label:'Description'}, {key:'icon', label:'Icône'}]} />
      
      <Button variant="success" onClick={() => onSave('passeport', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

const FooterModal = ({ data, onSave, onClose, saving }) => {
  const [local, setLocal] = useState(data || {});
  const setField = (f, v) => setLocal(p => ({ ...p, [f]: v }));
  return (
    <PortalModal isOpen={true} onClose={onClose} title="Modifier Footer">
      {renderInput('Adresse', local.address, v => setField('address', v))}
      {renderInput('Téléphone', local.phone, v => setField('phone', v))}
      {renderInput('Email', local.email, v => setField('email', v))}
      <StringListEditor label="Horaires" value={local.schedule} onChange={v => setField('schedule', v)} />
      
      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Call to Action</h3>
        {renderInput('Titre CTA', local.ctaTitle, v => setField('ctaTitle', v))}
        {renderInput('Description CTA', local.ctaDescription, v => setField('ctaDescription', v))}
        <ArrayEditor label="Boutons CTA" value={local.ctaButtons} onChange={v => setField('ctaButtons', v)} fields={[{key:'text', label:'Texte'}, {key:'link', label:'Lien'}, {key:'icon', label:'Icône'}]} />
      </div>

      <Button variant="success" onClick={() => onSave('footer', local)} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? '...' : 'Sauvegarder'}</Button>
    </PortalModal>
  );
};

// --- MAIN PAGE COMPONENT ---

const AdminHomePage = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  
  const [contents, setContents] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState('hero');

  // Modal controls
  const [editModal, setEditModal] = useState({ open: false, section: null, data: null });
  const [cardModal, setCardModal] = useState({ open: false, data: null });
  const [faqModal, setFaqModal] = useState({ open: false, data: null });

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'cards', label: 'Démarches' },
    { id: 'collecte', label: 'Collecte' },
    { id: 'services', label: 'Service public' },
    { id: 'enfance', label: 'Enfance' },
    { id: 'passeport', label: 'Passeport' },
    { id: 'faq', label: 'FAQ' },
    { id: 'footer', label: 'Footer' },
  ];

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = () => setToast(t => ({ ...t, open: false }));

  const fetchData = async () => {
    try {
      const res = await api.get('/home/all');
      setContents(res.data?.contents || []);
      setCards(res.data?.cards?.sort((a,b)=>a.order-b.order) || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Erreur inconnue');
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveContent = async (sectionName, data) => {
    setSaving(true);
    try {
      const existing = contents?.find(c => c.section === sectionName);
      if (existing && existing._id) await api.put(`/home/${existing._id}`, { ...data, section: sectionName });
      else await api.post('/home', { ...data, section: sectionName });
      showToast('Enregistré avec succès');
      setEditModal({ open: false });
      fetchData();
    } catch (err) { showToast("Erreur lors de l'enregistrement", 'error'); } 
    finally { setSaving(false); }
  };

  const handleSaveCard = async (cardData) => {
    setSaving(true);
    try {
      if (cardData._id) await api.put(`/home/${cardData._id}`, { ...cardData, type: 'card' });
      else await api.post('/home', { ...cardData, type: 'card', order: cards?.length || 0 });
      showToast('Carte enregistrée');
      setCardModal({ open: false, data: null });
      fetchData();
    } catch (err) { showToast("Erreur", 'error'); } 
    finally { setSaving(false); }
  };

  const handleReorderCard = async (index, direction) => {
    if (!cards || cards.length === 0) return;
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === cards.length - 1) return;
    
    const newCards = [...cards];
    const temp = newCards[index];
    newCards[index] = newCards[index + direction];
    newCards[index + direction] = temp;
    
    setCards(newCards);
    try {
      await Promise.all(newCards.map((c, i) => api.put(`/home/${c._id}`, { ...c, order: i, type: 'card' })));
      showToast('Ordre mis à jour');
    } catch (e) { showToast('Erreur', 'error'); }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await api.delete(`/home/${id}?type=card`); showToast('Supprimé'); fetchData(); } 
    catch (err) { showToast('Erreur', 'error'); }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await api.delete(`/home/${id}?type=content`); showToast('Supprimé'); fetchData(); } 
    catch (err) { showToast('Erreur', 'error'); }
  };

  const getSection = name => contents?.find(c => c.section === name) || {};
  const faqs = contents?.filter(c => c.section === 'faq') || [];

  if (loading) return <AdminLayout onLogout={logout}><div style={{ padding: '2rem' }}>Chargement...</div></AdminLayout>;
  if (error) return <AdminLayout onLogout={logout}><div style={{ padding: '2rem', color: 'red' }}>Erreur: {error}</div></AdminLayout>;

  return (
    <AdminLayout onLogout={logout}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '2rem', color: '#164022', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaHome /> Gestion de la page d'Accueil (CMS)
        </h1>
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', borderBottom: '2px solid #E5E7EB' }}>
          {tabs.map(tab => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.8rem 1.5rem', background: activeTab === tab.id ? '#16A34A' : '#F3F4F6',
                color: activeTab === tab.id ? 'white' : '#4B5563', border: 'none', borderRadius: '8px 8px 0 0',
                cursor: 'pointer', fontWeight: activeTab === tab.id ? 'bold' : 'normal', transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT RENDERER */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {activeTab === 'hero' && (
              <SectionContainer title="Héro" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'hero', data: getSection('hero') })}><FaEdit /> Modifier</Button>}>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                  <h3>{getSection('hero').title || 'Aucun titre'}</h3>
                  <p>{getSection('hero').subtitle}</p>
                </div>
              </SectionContainer>
            )}
            
            {activeTab === 'cards' && (
              <SectionContainer title="Démarches Administratives (Cartes)">
                <Button variant="primary" onClick={() => setCardModal({ open: true, data: { isActive: true } })} style={{ marginBottom: '1.5rem' }}>
                  <FaPlus style={{ marginRight: '8px' }} /> Ajouter une carte
                </Button>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {cards?.map((card, idx) => (
                    <div key={card._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: card.isActive ? '#fff' : '#f3f4f6', opacity: card.isActive ? 1 : 0.6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {card.imageUrl ? <img src={card.imageUrl.startsWith('http') ? card.imageUrl : `http://localhost:5000${card.imageUrl}`} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '8px' }}></div>}
                        <div>
                          <h4 style={{ margin: '0 0 0.3rem', color: '#111' }}>{card.title || ''} {card.isActive ? '' : '(Désactivée)'}</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.85rem', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.description || ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '1rem' }}>
                          <button disabled={idx === 0} onClick={() => handleReorderCard(idx, -1)} style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#ccc' : '#666' }}><FaArrowUp /></button>
                          <button disabled={idx === cards.length - 1} onClick={() => handleReorderCard(idx, 1)} style={{ border: 'none', background: 'none', cursor: idx === cards.length - 1 ? 'default' : 'pointer', color: idx === cards.length - 1 ? '#ccc' : '#666' }}><FaArrowDown /></button>
                        </div>
                        <button onClick={() => handleSaveCard({ ...card, isActive: !card.isActive })} style={{ padding: '0.5rem', cursor: 'pointer', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', color: '#666' }}>{card.isActive ? <FaEyeSlash title="Désactiver" /> : <FaEye title="Activer" />}</button>
                        <button onClick={() => setCardModal({ open: true, data: card })} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: '#E0E7FF', color: '#4F46E5', borderRadius: '4px' }}><FaEdit /></button>
                        <button onClick={() => handleDeleteCard(card._id)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: '#FEE2E2', color: '#DC2626', borderRadius: '4px' }}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionContainer>
            )}

            {activeTab === 'collecte' && (
              <SectionContainer title="Collecte" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'collecte', data: getSection('collecte') })}><FaEdit /> Modifier</Button>}>
                <p>{getSection('collecte').instructions || 'Aucune instruction'}</p>
              </SectionContainer>
            )}
            
            {activeTab === 'services' && (
              <SectionContainer title="Service Public" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'services', data: getSection('services') })}><FaEdit /> Modifier</Button>}>
                <h3>{getSection('services').title}</h3>
                <p>{getSection('services').description}</p>
              </SectionContainer>
            )}
            
            {activeTab === 'enfance' && (
              <SectionContainer title="Enfance" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'enfance', data: getSection('enfance') })}><FaEdit /> Modifier</Button>}>
                <h3>{getSection('enfance').title}</h3>
              </SectionContainer>
            )}
            
            {activeTab === 'passeport' && (
              <SectionContainer title="Passeport" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'passeport', data: getSection('passeport') })}><FaEdit /> Modifier</Button>}>
                <h3>{getSection('passeport').title}</h3>
              </SectionContainer>
            )}
            
            {activeTab === 'faq' && (
              <SectionContainer title="Questions Fréquentes">
                <Button variant="primary" onClick={() => setFaqModal({ open: true, data: {} })} style={{ marginBottom: '1.5rem' }}>
                  <FaPlus style={{ marginRight: '8px' }} /> Ajouter une question
                </Button>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {faqs?.map((faq, idx) => (
                    <div key={faq._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#f9fafb' }}>
                      <div><h4 style={{ margin: '0 0 0.5rem', color: '#111' }}>{faq.question || ''}</h4><p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{faq.answer || ''}</p></div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setFaqModal({ open: true, data: faq })} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: '#E0E7FF', color: '#4F46E5', borderRadius: '4px' }}><FaEdit /></button>
                        <button onClick={() => handleDeleteContent(faq._id)} style={{ padding: '0.5rem', cursor: 'pointer', border: 'none', background: '#FEE2E2', color: '#DC2626', borderRadius: '4px' }}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionContainer>
            )}
            
            {activeTab === 'footer' && (
              <SectionContainer title="Footer" action={<Button variant="primary" onClick={() => setEditModal({ open: true, section: 'footer', data: getSection('footer') })}><FaEdit /> Modifier</Button>}>
                <p>Adresse: {getSection('footer').address}</p>
                <p>Tel: {getSection('footer').phone}</p>
              </SectionContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* DYNAMIC EDIT MODALS */}
        {editModal.open && editModal.section === 'hero' && <HeroModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}
        {editModal.open && editModal.section === 'collecte' && <CollecteModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}
        {editModal.open && editModal.section === 'services' && <ServicesModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}
        {editModal.open && editModal.section === 'enfance' && <EnfanceModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}
        {editModal.open && editModal.section === 'passeport' && <PasseportModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}
        {editModal.open && editModal.section === 'footer' && <FooterModal data={editModal.data} onSave={handleSaveContent} onClose={() => setEditModal({open: false})} saving={saving} />}

        {/* CARD MODAL */}
        <PortalModal isOpen={cardModal.open} onClose={() => setCardModal({ open: false, data: null })} title={cardModal.data?._id ? "Modifier la carte" : "Ajouter une carte"}>
          {cardModal.data && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <ImageUpload label="Image de la carte" value={cardModal.data?.imageUrl || ''} onChange={url => setCardModal(p => ({ ...p, data: { ...p.data, imageUrl: url } }))} />
              {renderInput('Titre', cardModal.data?.title, val => setCardModal(p => ({ ...p, data: { ...p.data, title: val } })))}
              {renderInput('Description', cardModal.data?.description, val => setCardModal(p => ({ ...p, data: { ...p.data, description: val } })), '', true)}
              {renderInput('Texte du bouton', cardModal.data?.buttonText, val => setCardModal(p => ({ ...p, data: { ...p.data, buttonText: val } })))}
              {renderInput('Lien du bouton', cardModal.data?.slug || cardModal.data?.buttonLink, val => setCardModal(p => ({ ...p, data: { ...p.data, slug: val, buttonLink: val } })))}
              {renderInput('Icône de titre (ex: fa-briefcase)', cardModal.data?.icon, val => setCardModal(p => ({ ...p, data: { ...p.data, icon: val } })))}
              
              <ArrayEditor label="Statistiques" value={cardModal.data?.statistics} onChange={v => setCardModal(p => ({ ...p, data: { ...p.data, statistics: v } }))} fields={[{key:'value', label:'Valeur (ex: 1 mois)'}, {key:'label', label:'Libellé'}]} />
              <ArrayEditor label="Actions" value={cardModal.data?.actions} onChange={v => setCardModal(p => ({ ...p, data: { ...p.data, actions: v } }))} fields={[{key:'text', label:'Texte'}, {key:'icon', label:'Icône'}]} />

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem' }}>
                <input type="checkbox" checked={cardModal.data?.isActive !== false} onChange={e => setCardModal(p => ({ ...p, data: { ...p.data, isActive: e.target.checked } }))} /> Carte active
              </label>
              <Button variant="success" onClick={() => handleSaveCard(cardModal.data)} disabled={saving} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                {saving ? '...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </PortalModal>

        {/* FAQ MODAL */}
        <PortalModal isOpen={faqModal.open} onClose={() => setFaqModal({ open: false, data: null })} title={faqModal.data?._id ? "Modifier la question" : "Ajouter une question"}>
          {faqModal.data && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {renderInput('Question', faqModal.data?.question, val => setFaqModal(p => ({ ...p, data: { ...p.data, question: val } })))}
              {renderInput('Réponse', faqModal.data?.answer, val => setFaqModal(p => ({ ...p, data: { ...p.data, answer: val } })), '', true)}
              <Button variant="success" onClick={async () => {
                setSaving(true);
                try {
                  if (faqModal.data._id) await api.put(`/home/${faqModal.data._id}`, { ...faqModal.data, section: 'faq' });
                  else await api.post('/home', { ...faqModal.data, section: 'faq' });
                  showToast('Enregistré'); setFaqModal({ open: false, data: null }); fetchData();
                } catch (e) { showToast('Erreur', 'error'); } finally { setSaving(false); }
              }} disabled={saving} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                {saving ? '...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </PortalModal>

        <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />
      </motion.div>
    </AdminLayout>
  );
};

export default AdminHomePage;
