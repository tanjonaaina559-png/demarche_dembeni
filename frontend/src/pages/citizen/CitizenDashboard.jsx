import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { getImageUrl } from '../../utils/imageUrl';
import {
  FaFileAlt, FaHourglassHalf, FaCheckCircle, FaTimesCircle,
  FaCloudUploadAlt, FaCalendarCheck, FaArrowRight, FaFolderOpen,
  FaClock, FaCheckDouble
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './CitizenDashboard.css';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#059669'];

// Map category slug → label + icon
const CATEGORY_MAP = {
  civil:      { label: 'État Civil',     icon: 'fas fa-users'           },
  documents:  { label: 'Documents',      icon: 'fas fa-file-alt'        },
  enfance:    { label: 'Enfance',        icon: 'fas fa-baby'            },
  logement:   { label: 'Logement',       icon: 'fas fa-home'            },
  urbanisme:  { label: 'Urbanisme',      icon: 'fas fa-hard-hat'        },
  ecologie:   { label: 'Écologie',       icon: 'fas fa-leaf'            },
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]         = useState(true);
  const [stats, setStats]             = useState({ total: 0, pending: 0, inProgress: 0, approved: 0, rejected: 0, completed: 0, recentRequests: [] });
  const [chartData, setChartData]     = useState([]);
  const [procedures, setProcedures]   = useState([]);
  const [procsLoading, setProcsLoading] = useState(true);

  // Fetch citizen requests
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/requests/my-requests');
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const s = {
            total:          data.length,
            pending:        data.filter(r => r.status === 'en attente').length,
            inProgress:     data.filter(r => r.status === 'en cours').length,
            approved:       data.filter(r => r.status === 'approuvée' || r.status === 'validée').length,
            rejected:       data.filter(r => r.status === 'rejetée').length,
            completed:      data.filter(r => r.status === 'terminée').length,
            recentRequests: sorted.slice(0, 5)
          };
          setStats(s);
          setChartData([
            { name: 'En attente', value: s.pending  },
            { name: 'En cours',   value: s.inProgress },
            { name: 'Validées',   value: s.approved },
            { name: 'Rejetées',   value: s.rejected },
            { name: 'Terminées',  value: s.completed }
          ]);
        }
      } catch (err) {
        console.error('Erreur requêtes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Fetch procedures
  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const { data } = await api.get('/procedures');
        setProcedures(Array.isArray(data) ? data.filter(p => p.active).slice(0, 6) : []);
      } catch (err) {
        console.error('Erreur procédures:', err);
        setProcedures([]);
      } finally {
        setProcsLoading(false);
      }
    };
    fetchProcedures();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="citizen-dashboard">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-hero">
        <div className="hero-content" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="hero-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', padding: '4px', flexShrink: 0 }}>
            {user?.profilePicture ? (
              <img src={getImageUrl(user.profilePicture)} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '32px' }}>
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div>
            <h1>Bonjour, {user?.firstname} {user?.lastname} !</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fas fa-id-card" style={{ color: '#A7F3D0' }}></i> Citoyen {user?.status === 'approved' ? 'Vérifié' : 'En attente'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fas fa-calendar-alt" style={{ color: '#A7F3D0' }}></i> Inscrit le {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}
              </span>
            </p>
          </div>
        </div>
        <div className="hero-date" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCalendarCheck />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <Link to="/citizen/profile" style={{ color: '#fff', fontSize: '0.8rem', textDecoration: 'underline' }}>Modifier mon profil</Link>
        </div>
      </motion.div>

      {/* ── STATS CARDS ──────────────────────────────────────────────────── */}
      <div className="stats-grid">
        {[
          { label: 'Total',          value: stats.total,      icon: <FaFileAlt />,        cls: 'primary' },
          { label: 'En Attente',     value: stats.pending,    icon: <FaHourglassHalf />,  cls: 'warning' },
          { label: 'En Cours',       value: stats.inProgress, icon: <FaClock />,          cls: 'info' },
          { label: 'Validées',       value: stats.approved,   icon: <FaCheckCircle />,    cls: 'success' },
          { label: 'Rejetées',       value: stats.rejected,   icon: <FaTimesCircle />,    cls: 'danger'  },
          { label: 'Terminées',      value: stats.completed,  icon: <FaCheckDouble />,    cls: 'completed' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * (i + 1) }} className={`stat-card ${s.cls}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CHARTS ───────────────────────────────────────────────────────── */}
      <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="dashboard-panel">
          <h2 className="panel-title">Répartition des demandes</h2>
          {stats.total === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <FaFolderOpen size={40} color="#CBD5E1" />
              <p>Aucune demande pour le moment.</p>
            </div>
          ) : (
            <>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Demandes`, 'Total']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <span style={{ color: '#F59E0B' }}>● En attente</span>
                <span style={{ color: '#10B981' }}>● Validées</span>
                <span style={{ color: '#EF4444' }}>● Rejetées</span>
              </div>
            </>
          )}
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="dashboard-panel">
          <h2 className="panel-title">Statistiques par statut</h2>
          {stats.total === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <FaFileAlt size={40} color="#CBD5E1" />
              <p>Aucune statistique disponible.</p>
            </div>
          ) : (
            <div style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value} Demandes`, 'Total']} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── RECENT REQUESTS + POPULAR PROCEDURES ─────────────────────────── */}
      <div className="dashboard-content-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px' }}>

        {/* Activités récentes */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title"><i className="fas fa-bell" style={{ color: '#F59E0B', marginRight: '8px' }}></i> Notifications & Activités récentes</h2>
            <Link to="/mes-demandes" className="view-all-link">Voir tout</Link>
          </div>
          <div className="recent-requests-list">
            {stats.recentRequests.length === 0 ? (
              <div className="empty-state">
                <FaCloudUploadAlt size={40} color="#CBD5E1" />
                <p>Aucune demande récente.</p>
                <Link to="/demarches" className="btn btn-sm btn-primary" style={{ marginTop: '10px', display: 'inline-block', padding: '8px 16px', background: 'var(--vert-600)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
                  Faire une démarche
                </Link>
              </div>
            ) : (
              stats.recentRequests.map(req => (
                <div key={req._id} className="request-item">
                  <div className="req-info">
                    <h4>{req.procedure?.title || req.procedureId?.title || req.procedure || 'Démarche'}</h4>
                    <span>{new Date(req.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <span className={`status-badge ${req.status}`}>
                    {req.status === 'en attente' ? 'En attente' :
                     req.status === 'approuvée'  ? 'Approuvée'  :
                     req.status === 'rejetée'    ? 'Rejetée'    :
                     req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Démarches populaires */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }} className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Démarches disponibles</h2>
            <Link to="/demarches" className="view-all-link">Voir tout</Link>
          </div>
          {procsLoading ? (
            <Loader />
          ) : procedures.length === 0 ? (
            <div className="empty-state">
              <FaFileAlt size={40} color="#CBD5E1" />
              <p>Aucune démarche disponible.</p>
            </div>
          ) : (
            <div className="recent-requests-list">
              {procedures.map(proc => {
                const cat = CATEGORY_MAP[proc.category] || { label: proc.category, icon: 'fas fa-file-alt' };
                return (
                  <div key={proc._id} className="request-item" style={{ cursor: 'default' }}>
                    <div className="req-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vert-600)', flexShrink: 0 }}>
                        <i className={cat.icon} style={{ fontSize: '16px' }}></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{proc.title}</h4>
                        <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                          {cat.label} · {proc.processingTime || 'Variable'} · {proc.fees || 'Gratuit'}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/demarches/${proc._id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--vert-600)', fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      Faire <FaArrowRight size={11} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
};

export default CitizenDashboard;
