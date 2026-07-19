import os
import re

file_path = "frontend/src/pages/admin/Requests.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix downloadRequestPdf
new_download = """  const downloadRequestPdf = async (id, type = 'receipt') => {
    console.log('[DOWNLOAD]', id);
    try {
      const token = localStorage.getItem('token') ||
        JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${apiBase}/requests/${id}/pdf?type=${type}`;
      console.log('[API REQUEST]', url);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'follow'
      });
      
      console.log('[API RESPONSE]', response);

      if (response.ok) {
        // If Cloudinary redirected us, open the Cloudinary URL
        if (response.redirected || response.url.includes('cloudinary')) {
          window.open(response.url, '_blank');
        } else {
          // If it is a local file Blob returned directly
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          window.open(objectUrl, '_blank');
        }
      } else if (response.status === 403) {
        showToast('Document disponible uniquement pour les demandes validées.', 'error');
      } else {
        showToast('Impossible de télécharger le PDF.', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Erreur inattendue.', 'error');
    }
  };"""
content = re.sub(r'  const downloadRequestPdf = async \(id, type = \'receipt\'\) => \{.*?\n  \};\n', new_download + '\n', content, flags=re.DOTALL)

# 2. Add exact logs to handleUpdateStatus
content = content.replace(
    "console.log('[UPDATE STATUS]', selectedRequest._id, status);",
    "console.log('[VALIDATE/REJECT]', selectedRequest._id);\n    console.log('[UPDATE STATUS]', selectedRequest._id, status);"
)

new_update_status = """  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('[UPDATE STATUS]', selectedRequest._id, status);
    const url = `/requests/${selectedRequest._id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, {
        status,
        adminComment: commentaire,
      });
      console.log('[API RESPONSE]', res);
      showToast('Statut mis à jour avec succès');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSubmitting(false);
    }
  };"""
content = re.sub(r'  const handleUpdateStatus = async \(e\) => \{.*?\n  \};\n', new_update_status + '\n', content, flags=re.DOTALL)

# 3. Add exact logs to handleQuickApprove
new_quick_approve = """  const handleQuickApprove = async (id) => {
    console.log('[VALIDATE]', id);
    const url = `/requests/${id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, { status: 'Validée' });
      console.log('[API RESPONSE]', res);
      showToast('Demande validée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur', 'error'); }
  };"""
content = re.sub(r'  const handleQuickApprove = async \(id\) => \{.*?\n  \};\n', new_quick_approve + '\n', content, flags=re.DOTALL)

# 4. Add exact logs to handleQuickReject
new_quick_reject = """  const handleQuickReject = async (id) => {
    console.log('[REJECT]', id);
    const url = `/requests/${id}/status`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.put(url, { status: 'Rejetée' });
      console.log('[API RESPONSE]', res);
      showToast('Demande rejetée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur', 'error'); }
  };"""
content = re.sub(r'  const handleQuickReject = async \(id\) => \{.*?\n  \};\n', new_quick_reject + '\n', content, flags=re.DOTALL)

# 5. Add exact logs to handleDelete
new_delete = """  const handleDelete = async () => {
    const id = confirm.id;
    setConfirm({ open: false, id: null });
    console.log('[DELETE]', id);
    const url = `/admin/requests/${id}`;
    console.log('[API REQUEST]', url);
    try {
      const res = await api.delete(url);
      console.log('[API RESPONSE]', res);
      showToast('Demande supprimée');
      fetchRequests();
    } catch(err) { console.error(err); showToast('Erreur lors de la suppression', 'error'); }
  };"""
content = re.sub(r'  const handleDelete = async \(\) => \{.*?\n  \};\n', new_delete + '\n', content, flags=re.DOTALL)

# 6. Add stopPropagation to all action buttons in the table
# We will use simple string replacements for the button onClick handlers

# Eye Button
content = content.replace(
    "onClick={(e) => { e.stopPropagation(); console.log('[VIEW]', row._id); setSelectedRequest(row); setStatus(row.status || 'En attente'); setCommentaire(row.adminComment || ''); }}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('[VIEW]', row._id); setSelectedRequest(row); setStatus(row.status || 'En attente'); setCommentaire(row.adminComment || ''); }}"
)

# Check Button
content = content.replace(
    "onClick={() => handleQuickApprove(row._id)}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickApprove(row._id); }}"
)

# X Button
content = content.replace(
    "onClick={() => handleQuickReject(row._id)}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickReject(row._id); }}"
)

# Download Receipt Button
content = content.replace(
    "onClick={() => downloadRequestPdf(row._id, 'receipt')}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadRequestPdf(row._id, 'receipt'); }}"
)

# Download Official Button
content = content.replace(
    "onClick={() => downloadRequestPdf(row._id, 'official')}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadRequestPdf(row._id, 'official'); }}"
)

# Delete Button
content = content.replace(
    "onClick={() => setConfirm({ open: true, id: row._id })}",
    "onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirm({ open: true, id: row._id }); }}"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Requests.jsx patched successfully!")
