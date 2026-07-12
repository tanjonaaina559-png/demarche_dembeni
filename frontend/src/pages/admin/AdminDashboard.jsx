import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import Toast from '../../components/ui/Toast';
import { motion } from 'framer-motion';
import { Users, FileText, Bell, BarChart2, CheckCircle, XCircle, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const [adminName, setAdminName] = useState('Admin');
  const [stats, setStats]         = useState({});
  const [citizens, setCitizens]   = useState([]);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ open: true, message, type });
  const closeToast = useCallback(() => setToast(t => ({ ...t, open: false })), []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, citizensRes, requestsRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/citizens'),
        api.get('/admin/requests'),
      ]);
      setStats(statsRes?.data || {});
      setCitizens(Array.isArray(citizensRes?.data) ? citizensRes.data : []);
      setRequests(Array.isArray(requestsRes?.data) ? requestsRes.data : []);
    } catch (err) {
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
      return;
    }
    setAdminName(authUser?.firstname || userInfo.firstname || 'Admin');
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => logout();

  /* ── Actions citoyens ── */
  const handleValidate = async id => {
    if (!id) return;
    try {
      await api.put(`/admin/citizens/${id}/validate`);
      showToast('Citoyen validé avec succès');
      fetchData();
    } catch { showToast('Erreur lors de la validation', 'error'); }
  };

  const handleReject = async id => {
    if (!id) return;
    try {
      await api.put(`/admin/citizens/${id}/reject`);
      showToast('Citoyen refusé');
      fetchData();
    } catch { showToast('Erreur', 'error'); }
  };

  const handleDelete = async id => {
    if (!id) return;
    if (!window.confirm('Confirmer la suppression du citoyen ?')) return;
    try {
      await api.delete(`/admin/citizens/${id}`);
      showToast('Citoyen supprimé');
      fetchData();
    } catch { showToast('Erreur lors de la suppression', 'error'); }
  };

  /* ── Mise à jour statut demande ── */
  const handleUpdateStatus = async (id, status) => {
    if (!id) return;
    try {
      await api.put(`/admin/requests/${id}/status`, { status });
      showToast(`Statut mis à jour : ${status}`);
      fetchData();
    } catch { showToast('Erreur', 'error'); }
  };

  /* ── Colonnes ── */
  const citizenColumns = [
    {
      Header: 'Nom', accessor: 'fullName',
      Cell: row => `${row?.firstname || ''} ${row?.lastname || ''}`.trim() || '-',
    },
    { Header: 'Email', accessor: 'email', Cell: row => row?.email || '' },
    {
      Header: 'Inscrit le', accessor: 'createdAt',
      Cell: row => row?.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-',
    },
    { Header: 'Statut', accessor: 'status', Cell: row => <StatusBadge status={row?.status || 'pending'} /> },
    {
      Header: 'Actions', accessor: 'actions',
      Cell: row => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {row?.status === 'pending' && (
            <>
              <Button variant="success" onClick={() => handleValidate(row?._id)}>Valider</Button>
              <Button variant="danger"  onClick={() => handleReject(row?._id)}>Refuser</Button>
            </>
          )}
          <Button variant="secondary" onClick={() => handleDelete(row?._id)}>Supprimer</Button>
        </div>
      ),
    },
  ];

  const requestColumns = [
    {
      Header: 'Citoyen', accessor: 'citizen',
      Cell: row => {
        const c = row?.citizen;
        if (!c) return 'Inconnu';
        return (`${c.firstname || ''} ${c.lastname || ''}`.trim()) || c.email || 'Inconnu';
      },
    },
    { Header: 'Démarche', accessor: 'procedure', Cell: row => row?.procedure?.title || row?.procedure || '-' },
    {
      Header: 'Date', accessor: 'createdAt',
      Cell: row => row?.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '-',
    },
    { Header: 'Statut', accessor: 'status', Cell: row => <StatusBadge status={row?.status || 'en attente'} /> },
    {
      Header: 'Changer statut', accessor: 'actions',
      Cell: row => (
        <select
          value={row?.status || 'En attente'}
          onChange={e => handleUpdateStatus(row?._id, e.target.value)}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13 }}
        >
          <option value="En attente">En attente</option>
          <option value="Reçue">Reçue</option>
          <option value="En cours">En cours</option>
          <option value="Validée">Validée</option>
          <option value="Rejetée">Rejetée</option>
          <option value="Complément demandé">Complément demandé</option>
        </select>
      ),
    },
  ];

  /* ── Filtrage ── */
  const filteredCitizens = citizens.filter(c =>
    `${c?.firstname || ''} ${c?.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = requests.filter(r =>
    `${r?.citizen?.firstname || ''} ${r?.citizen?.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r?.procedure || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Chart data ── */
  const chartData = [
    { name: 'En attente', value: stats?.attente || 0,    fill: '#F59E0B' },
    { name: 'Approuvées', value: stats?.approuvees || 0, fill: '#10B981' },
    { name: 'Rejetées',   value: stats?.rejetees || 0,   fill: '#EF4444' },
  ];

  /* ── Export CSV ── */
  const exportCSV = () => {
    const rows = [
      ['Statut', 'Total'],
      ['En attente', stats?.attente || 0],
      ['Approuvées', stats?.approuvees || 0],
      ['Rejetées',   stats?.rejetees || 0],
      ['Total citoyens', stats?.totalCitizens || 0],
      ['Total procédures', stats?.totalProcedures || 0],
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'rapport_dembeni.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Rapport CSV téléchargé');
  };

  if (loading) return <Loader />;

  return (
    <AdminLayout adminName={adminName} onLogout={handleLogout}>
      <Toast isOpen={toast.open} onClose={closeToast} message={toast.message} type={toast.type} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* KPI Cards */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <DashboardCard title="Citoyens Inscrits"  value={stats?.totalCitizens || 0}   icon={<Users size={24} />}       color="#4F46E5" />
          <DashboardCard title="Procédures Actives" value={stats?.totalProcedures || 0}  icon={<FileText size={24} />}     color="#06B6D4" />
          <DashboardCard title="Demandes en Attente" value={stats?.attente || 0}           icon={<Bell size={24} />}        color="#F59E0B" />
          <DashboardCard title="Demandes Validées"  value={stats?.approuvees || 0}        icon={<CheckCircle size={24} />} color="#10B981" />
          <DashboardCard title="Demandes Rejetées"  value={stats?.rejetees || 0}          icon={<XCircle size={24} />} color="#EF4444" />
          <DashboardCard title="Total Demandes"     value={stats?.total || 0}             icon={<BarChart2 size={24} />}    color="#8B5CF6" />
        </section>

        {/* Export + Graphique */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderColor: '#e4e4e7' }}>
            <Download size={16} /> Exporter le rapport CSV
          </button>
        </div>

        <section style={{ marginTop: '1.5rem', height: 380, background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#18181b', fontSize: '1.1rem', fontWeight: 600 }}>Aperçu des Demandes</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend />
              <Bar dataKey="value" name="Demandes" radius={[4, 4, 0, 0]}
                fill="#3B82F6"
                label={{ position: 'top', fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Recherche */}
        <section style={{ marginTop: '32px' }}>
          <SearchBar
            placeholder="Rechercher un citoyen, un email, une démarche..."
            value={searchTerm || ''}
            onChange={val => setSearchTerm(val)}
          />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginTop: '24px', marginBottom: '40px' }}>
          {/* Citoyens récents */}
          <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4e4e7', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e4e4e7', background: '#fafafa' }}>
              <h2 style={{ color: '#18181b', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Dernières Inscriptions</h2>
            </div>
            <div style={{ padding: '20px' }}>
              {filteredCitizens.length === 0
                ? <EmptyState message="Aucun citoyen trouvé" />
                : <DataTable columns={citizenColumns} data={filteredCitizens.slice(0, 5)} />}
            </div>
          </section>

          {/* Demandes récentes */}
          <section style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e4e4e7', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e4e4e7', background: '#fafafa' }}>
              <h2 style={{ color: '#18181b', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Dernières Demandes</h2>
            </div>
            <div style={{ padding: '20px' }}>
              {filteredRequests.length === 0
                ? <EmptyState message="Aucune demande trouvée" />
                : <DataTable columns={requestColumns} data={filteredRequests.slice(0, 5)} />}
            </div>
          </section>
        </div>

      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
