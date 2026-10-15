import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Search, GraduationCap, Server } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'All Students', icon: Users },
    { to: '/add-student', label: 'Add Student', icon: UserPlus },
    { to: '/search', label: 'Search Student', icon: Search },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="sidebar-brand">Edu<span>Track</span></div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Student Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-tier-badge">
            <Server size={12} />
            <span>3-Tier Architecture</span>
          </div>
          <span style={{ marginTop: '0.25rem' }}>Tier 1: Netlify (React)</span>
          <span>Tier 2: Render (Express)</span>
          <span>Tier 3: MongoDB Atlas</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
