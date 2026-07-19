import api from '../services/api';

/**
 * Shared PDF download/view utility.
 *
 * The backend returns: { url: "https://res.cloudinary.com/..." }
 * Cloudinary resource_type is 'raw' → files are public, no auth needed.
 *
 * Strategy:
 *  - "view"     → open URL in new tab (window.open would be blocked by popups in async,
 *                 so we use an <a target="_blank"> click instead).
 *  - "download" → force download via <a download> click.
 *
 * @param {string} requestId  - MongoDB _id of the request
 * @param {'receipt'|'official'} type - PDF type
 * @param {'view'|'download'} action  - What to do with the URL
 * @returns {Promise<{ok:boolean, error?:string}>}
 */
export const handlePdf = async (requestId, type = 'receipt', action = 'view') => {
  try {
    const url = `/requests/${requestId}/pdf?type=${type}`;
    console.log(`[PDF] ${action.toUpperCase()} type=${type} id=${requestId}`);

    // Axios interceptor injects Authorization header automatically
    const res = await api.get(url);
    console.log('[PDF] Backend response:', res.data);

    const pdfUrl = res.data?.url;
    if (!pdfUrl) {
      console.error('[PDF] No url in response:', res.data);
      return { ok: false, error: 'Le lien PDF est introuvable dans la réponse du serveur.' };
    }

    console.log(`[PDF] Opening URL: ${pdfUrl.substring(0, 80)}...`);

    // Use an anchor element — this is NOT blocked by popup blockers
    // (unlike window.open() called from inside async functions)
    const a = document.createElement('a');
    a.href = pdfUrl;

    if (action === 'download') {
      // Force download with a filename
      const filename = `${type === 'official' ? 'document-officiel' : 'recepisse'}-${requestId}.pdf`;
      a.download = filename;
    } else {
      // Open in new tab for viewing
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    // Must be in DOM briefly for Firefox compatibility
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return { ok: true };
  } catch (error) {
    console.error('[PDF] Error:', error);
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;

    if (status === 403) {
      return { ok: false, error: 'Document officiel disponible uniquement après validation de la demande.' };
    }
    if (status === 404) {
      return { ok: false, error: 'PDF introuvable pour cette demande.' };
    }
    if (status === 401) {
      return { ok: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }
    return { ok: false, error: `Erreur : ${msg}` };
  }
};
