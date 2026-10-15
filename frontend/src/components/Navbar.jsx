import React, { useState, useEffect } from 'react';
import { Menu, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { studentApi } from '../api/studentApi';

const Navbar = ({ onToggleSidebar }) => {
  const [dbStatus, setDbStatus] = useState('checking'); // 'connected', 'disconnected', 'checking'

  useEffect(() => {
    let isMounted = true;
    const checkSystemHealth = async () => {
      try {
        const res = await studentApi.checkHealth();
        if (isMounted) {
          if (res?.database?.status === 'connected') {
            setDbStatus('connected');
          } else {
            setDbStatus('disconnected');
          }
        }
      } catch (err) {
        if (isMounted) {
          setDbStatus('disconnected');
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="navbar-title">Student Information System</h1>
      </div>

      <div className="navbar-right">
        <div className="system-status-indicator" title={`Database status: ${dbStatus}`}>
          <Database size={15} />
          <span
            className={`status-dot ${
              dbStatus === 'connected' ? 'online' : dbStatus === 'disconnected' ? 'offline' : ''
            }`}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {dbStatus === 'connected'
              ? 'Atlas Connected'
              : dbStatus === 'disconnected'
              ? 'Offline / Connecting'
              : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
