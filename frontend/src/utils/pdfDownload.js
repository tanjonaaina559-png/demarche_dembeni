import api from '../services/api';

/**
 * Shared PDF download/view utility.
 */
export const handlePdf = async (requestId, type = 'receipt', action = 'view') => {
  // Pre-open a blank window synchronously to bypass popup blockers (if action is view)
  let newWindow = null;
  if (action === 'view') {
    newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('Chargement du document...');
    }
  }

  try {
    const url = `/requests/${requestId}/pdf?type=${type}`;
    console.log(`[PDF] ${action.toUpperCase()} type=${type} id=${requestId}`);

    const res = await api.get(url);
    console.log('[PDF] Backend response:', res.data);

    const pdfUrl = res.data?.url;
    if (!pdfUrl) {
      if (newWindow) newWindow.close();
      return { ok: false, error: 'Le lien PDF est introuvable.' };
    }

    if (action === 'view') {
      if (newWindow) {
        newWindow.location.href = pdfUrl;
      } else {
        window.location.href = pdfUrl; // fallback if popup blocked completely
      }
    } else if (action === 'download') {
      // Force download of cross-origin file by fetching it as a blob
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${type === 'official' ? 'document-officiel' : 'recepisse'}-${requestId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      } catch (fetchErr) {
        console.error('[PDF] Fetch blob error:', fetchErr);
        // Fallback: just open the URL and let the browser handle it
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }

    return { ok: true };
  } catch (error) {
    if (newWindow) newWindow.close();
    console.error('[PDF] Error:', error);
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;

    if (status === 403) return { ok: false, error: 'Document disponible uniquement après validation.' };
    if (status === 404) return { ok: false, error: 'PDF introuvable pour cette demande.' };
    if (status === 401) return { ok: false, error: 'Session expirée.' };
    
    return { ok: false, error: `Erreur : ${msg}` };
  }
};

