import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../layouts/AdminLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import {
  FaChartBar, FaUsers, FaFileAlt, FaCheckCircle,
  FaTimesCircle, FaClock, FaLayerGroup,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  CartesianGrid, Legend,
} from 'recharts';

const PIE_COLORS   = ['#F59E0B', '#10B981', '#EF4444'];
const CITIZEN_COLS = ['#10B981', '#F59E0B', '#EF4444'];

const Statistics = () => {
  const { logout } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/admin/statistics');
        setStats(res?.data || {});
      } catch (e) {
        setError('Erreur lors du chargement des statistiques.');
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Loader />;

  /* ── Données graphiques ── */
  const monthlyData = Array.isArray(stats?.monthlyData)
    ? stats.monthlyData.map(item => ({ month: item?.month || '', Demandes: item?.count ?? 0 }))
    : [];

  const pieData = [
    { name: 'En attente', value: stats?.attente    ?? 0 },
    { name: 'Approuvées', value: stats?.approuvees ?? 0 },
    { name: 'Rejetées',   value: stats?.rejetees   ?? 0 },
  ].filter(d => d.value > 0);

  const citizenPieData = [
    { name: 'Actifs/Approuvés', value: (stats?.totalCitizens || 0) - (stats?.pendingCitizens || 0) },
    { name: 'En attente',       value: stats?.pendingCitizens ?? 0 },
  ].filter(d => d.value > 0);

  const procedureData = Array.isArray(stats?.parProcedure)
    ? stats.parProcedure.map(p => ({ name: p._id || 'Inconnu', total: p.count ?? 0 }))
    : [];

  const cardStyle = {
    background: 'white', padding: 24, borderRadius: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: '2rem',
  };

  return (
    <AdminLayout
      adminName="Admin"
      onLogout={() => logout()}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        {/* Titre + message erreur */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#164022' }}>Statistiques du système</h2>
          {error && <span style={{ color: '#EF4444', fontSize: 14 }}>{error}</span>}
        </div>

        {/* ── KPI Cards ── */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '1.2rem' }}>
          <DashboardCard title="Total Demandes"    value={stats?.total          ?? 0} icon={<FaChartBar    size={20} />} color="#3B82F6" />
          <DashboardCard title="Approuvées"        value={stats?.approuvees     ?? 0} icon={<FaCheckCircle  size={20} />} color="#10B981" />
          <DashboardCard title="Rejetées"          value={stats?.rejetees       ?? 0} icon={<FaTimesCircle  size={20} />} color="#EF4444" />
          <DashboardCard title="En attente"        value={stats?.attente        ?? 0} icon={<FaClock        size={20} />} color="#F59E0B" />
          <DashboardCard title="Citoyens inscrits" value={stats?.totalCitizens  ?? 0} icon={<FaUsers        size={20} />} color="#8B5CF6" />
          <DashboardCard title="Procédures actives" value={stats?.activeProcedures ?? 0} icon={<FaFileAlt   size={20} />} color="#06B6D4" />
          <DashboardCard title="Total procédures"  value={stats?.totalProcedures ?? 0} icon={<FaLayerGroup  size={20} />} color="#64748B" />
        </section>

        {/* ── Évolution mensuelle (AreaChart) ── */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '1.5rem', color: '#164022' }}>Évolution mensuelle des demandes ({new Date().getFullYear()})</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemandes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="Demandes"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorDemandes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Pas encore de données mensuelles pour cette année." />
          )}
        </div>

        {/* ── Pie charts côte à côte ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '2rem' }}>

          {/* Statuts des demandes */}
          <div style={{ ...cardStyle, marginTop: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#164022' }}>Répartition des statuts</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Aucune donnée disponible." />
            )}
          </div>

          {/* Statuts citoyens */}
          <div style={{ ...cardStyle, marginTop: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#164022' }}>Statuts des comptes citoyens</h3>
            {citizenPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={citizenPieData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {citizenPieData.map((_, i) => <Cell key={i} fill={CITIZEN_COLS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="Aucun citoyen enregistré." />
            )}
          </div>
        </div>

        {/* ── BarChart horizontal : demandes par démarche ── */}
        {procedureData.length > 0 && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '1.5rem', color: '#164022' }}>Demandes par type de démarche (top 10)</h3>
            <ResponsiveContainer width="100%" height={Math.max(260, procedureData.length * 40)}>
              <BarChart data={procedureData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="total" name="Demandes" fill="#8B5CF6" radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Activité récente ── */}
        {Array.isArray(stats?.recentActivity) && stats.recentActivity.length > 0 && (
          <div style={{ ...cardStyle, marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#164022' }}>Activité récente (10 dernières demandes)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={th}>Citoyen</th>
                    <th style={th}>Démarche</th>
                    <th style={th}>Statut</th>
                    <th style={th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map(act => (
                    <tr key={act._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={td}>
                        {act.citizen
                          ? `${act.citizen.firstname || ''} ${act.citizen.lastname || ''}`.trim() || act.citizen.email
                          : 'Inconnu'}
                      </td>
                      <td style={td}>{act.procedure || '-'}</td>
                      <td style={td}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                          background: act.status === 'approuvée' ? '#D1FAE5' : act.status === 'rejetée' ? '#FEE2E2' : '#FEF3C7',
                          color: act.status === 'approuvée' ? '#059669' : act.status === 'rejetée' ? '#DC2626' : '#D97706',
                        }}>
                          {act.status || 'en attente'}
                        </span>
                      </td>
                      <td style={td}>{act.createdAt ? new Date(act.createdAt).toLocaleDateString('fr-FR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </motion.div>
    </AdminLayout>
  );
};

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' };
const td = { padding: '10px 12px' };

export default Statistics;
