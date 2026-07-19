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
    const endpoint = type === 'official' ? 'official' : 'receipt';
    const url = `/requests/${requestId}/${endpoint}`;
    console.log(`[PDF] ${action.toUpperCase()} endpoint=${url} id=${requestId}`);

    const res = await api.get(url, { responseType: 'blob' });
    console.log('[PDF] Backend returned blob:', res.data.size, 'bytes');

    // Create a local blob URL for the downloaded PDF data
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);

    if (action === 'view') {
      if (newWindow) {
        newWindow.location.href = blobUrl;
      } else {
        window.location.href = blobUrl;
      }
      // Revoke the URL after a short delay to allow the browser to load it
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } else if (action === 'download') {
      const a = document.createElement('a');
      a.href = blobUrl;
      // The backend content-disposition usually handles filename, but we force one here just in case
      a.download = `${type === 'official' ? 'document-officiel' : 'recepisse'}-${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
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

