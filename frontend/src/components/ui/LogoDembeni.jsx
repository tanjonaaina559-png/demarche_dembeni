import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LogoDembeni = ({ 
  className = '', 
  size = 'md', // sm, md, lg, xl
  theme = 'dark', // dark, light
  withText = true,
  isLink = true 
}) => {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    sm: { img: 48, title: '14px', sub: '9px' },
    md: { img: 64, title: '18px', sub: '11px' },
    lg: { img: 80, title: '22px', sub: '13px' },
    xl: { img: 120, title: '28px', sub: '16px' }
  };
  
  const currentSize = sizes[size] || sizes.md;

  const content = (
    <div className={`logo-dembeni ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {!imgError ? (
        <img 
          src="/logo-dembeni.svg" 
          alt="Logo Commune de Dembéni" 
          style={{ height: `${currentSize.img}px`, width: 'auto', objectFit: 'contain' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          backgroundColor: '#eef5ef', borderRadius: '50%', 
          width: `${currentSize.img}px`, height: `${currentSize.img}px` 
        }}>
          <Building2 color="#164022" size={currentSize.img * 0.6} />
        </div>
      )}
      
      {withText && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
          <span style={{ 
            fontFamily: '"Poppins", sans-serif', fontWeight: 800, 
            fontSize: currentSize.title, letterSpacing: '0.02em', 
            color: theme === 'light' ? '#ffffff' : '#164022',
            textTransform: 'uppercase'
          }}>
            COMMUNE
          </span>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
        {content}
      </Link>
    );
  }

  return <div style={{ display: 'inline-block' }}>{content}</div>;
};

export default LogoDembeni;
