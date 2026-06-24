import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const btn = (bg, color) => ({
  padding: '6px 10px', background: bg, color, border: 'none',
  borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem'
});

const inp = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.9rem' };

// Generic key-value array editor
// fields: [{key, label, placeholder}]
export const ArrayEditor = ({ label, value = [], onChange, fields = [{key:'value',label:'Valeur'},{key:'label',label:'Libellé'}], addLabel = 'Ajouter' }) => {
  const items = Array.isArray(value) ? value : [];
  const add = () => onChange([...items, fields.reduce((a, f) => ({ ...a, [f.key]: '' }), {})]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, key, val) => { const copy = [...items]; copy[i] = { ...copy[i], [key]: val }; onChange(copy); };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600, color: '#374151' }}>{label}</label>
        <button style={btn('#16A34A', 'white')} onClick={add}><FaPlus size={10} /> {addLabel}</button>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${fields.length}, 1fr) 36px`, gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
          {fields.map(f => (
            <input key={f.key} style={inp} placeholder={f.placeholder || f.label} value={item[f.key] || ''} onChange={e => update(i, f.key, e.target.value)} />
          ))}
          <button style={{ ...btn('#FEE2E2', '#DC2626'), padding: '8px', justifyContent: 'center' }} onClick={() => remove(i)}><FaTrash size={12} /></button>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontStyle: 'italic' }}>Aucun élément. Cliquez sur "{addLabel}".</p>}
    </div>
  );
};

// Simple string list editor
export const StringListEditor = ({ label, value = [], onChange, placeholder = '', addLabel = 'Ajouter' }) => {
  const items = Array.isArray(value) ? value : [];
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, val) => { const copy = [...items]; copy[i] = val; onChange(copy); };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 600, color: '#374151' }}>{label}</label>
        <button style={btn('#16A34A', 'white')} onClick={add}><FaPlus size={10} /> {addLabel}</button>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: '8px', marginBottom: '8px' }}>
          <input style={inp} placeholder={placeholder} value={item || ''} onChange={e => update(i, e.target.value)} />
          <button style={{ ...btn('#FEE2E2', '#DC2626'), padding: '8px', justifyContent: 'center' }} onClick={() => remove(i)}><FaTrash size={12} /></button>
        </div>
      ))}
      {items.length === 0 && <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontStyle: 'italic' }}>Aucun élément.</p>}
    </div>
  );
};

export default ArrayEditor;
