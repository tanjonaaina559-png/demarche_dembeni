import React, { useState, useRef } from 'react';
import './UploadDocument.css';

const UploadDocument = ({ onUpload, maxSizeMB = 5, acceptedType = 'application/pdf' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  React.useEffect(() => {
    console.log("MOUNT COMPONENT - UploadDocument");
    return () => console.log("UNMOUNT COMPONENT - UploadDocument");
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    setError(null);
    
    // Check if acceptedType is a comma-separated list
    const acceptedTypesArray = acceptedType.split(',').map(t => t.trim().toLowerCase());
    
    let isValidType = false;
    for (let type of acceptedTypesArray) {
      if (type.startsWith('.')) {
        // It's an extension
        if (file.name.toLowerCase().endsWith(type)) {
          isValidType = true;
          break;
        }
      } else {
        // It's a mime type, maybe with wildcards
        if (type === file.type || type.startsWith(file.type.split('/')[0] + '/')) {
          isValidType = true;
          break;
        }
      }
    }

    if (!isValidType) {
      setError(`Le format du fichier n'est pas supporté. Accepté : ${acceptedType}`);
      return false;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Le fichier ne doit pas dépasser ${maxSizeMB}MB.`);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        if (onUpload) onUpload(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (onUpload) onUpload(selectedFile);
      }
    }
  };

  return (
    <div className="upload-container">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${error ? 'has-error' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept={acceptedType} 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
        <div className="upload-content">
          <div className="upload-icon-wrapper">
            <i className={`fas ${file ? 'fa-file-pdf text-danger' : 'fa-cloud-upload-alt text-primary'}`}></i>
          </div>
          {file ? (
            <div className="file-selected">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p className="upload-text"><strong>Cliquez pour envoyer</strong> ou glissez-déposez</p>
              <p className="upload-subtext">PDF, JPG, PNG (Max. {maxSizeMB}MB)</p>
            </>
          )}
        </div>
      </div>
      {error && <div className="upload-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
    </div>
  );
};

export default UploadDocument;
