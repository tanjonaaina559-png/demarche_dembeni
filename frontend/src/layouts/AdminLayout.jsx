import React from 'react';
import Sidebar from '../components/ui/Sidebar';
import TopNavbar from '../components/ui/TopNavbar';
import './AdminLayout.css';

/**
 * AdminLayout provides the common structure for all admin pages.
 * It contains a collapsible sidebar, a top navigation bar and a content area.
 */
const AdminLayout = ({ children, adminName, onLogout }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="admin-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`admin-main ${collapsed ? 'collapsed' : ''}`}>
        <TopNavbar adminName={adminName} onLogout={onLogout} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
