import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Layers,
  Clock,
  UserPlus,
  ArrowRight,
  Database,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { useToast } from '../components/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await studentApi.getStats();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h2 className="page-title">Executive Dashboard</h2>
            <p className="page-subtitle">Real-time statistics from MongoDB Atlas Data Tier</p>
          </div>
        </div>
        <div className="state-container">
          <div className="spinner" />
          <p className="state-title">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  const total = stats?.totalStudents || 0;
  const deptStats = stats?.departmentStats || [];
  const semStats = stats?.semesterStats || [];
  const recentStudents = stats?.recentStudents || [];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="page-title">Executive Dashboard</h2>
          <p className="page-subtitle">
            Three-tier cloud overview — Presentation, Application, and Data Tier
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/students" className="btn btn-secondary">
            View All Students <ArrowRight size={16} />
          </Link>
          <Link to="/add-student" className="btn btn-primary">
            <UserPlus size={16} /> Add Student
          </Link>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Enrolled Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="stat-value">{deptStats.length}</div>
            <div className="stat-label">Active Departments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-value">{semStats.length}</div>
            <div className="stat-label">Represented Semesters</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Database size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem', color: '#047857' }}>
              studentDB
            </div>
            <div className="stat-label">MongoDB Atlas Cluster</div>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="card">
          <div className="state-container">
            <div className="state-icon">
              <Users size={32} />
            </div>
            <h3 className="state-title">No Student Records Yet</h3>
            <p className="state-text">
              The MongoDB Atlas database is connected and ready. Start adding students to visualize live enrollment statistics.
            </p>
            <Link to="/add-student" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
              <UserPlus size={16} /> Add Your First Student
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Department Breakdown */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} color="#2563eb" /> Department Distribution
              </h3>
              <span className="badge badge-gray">{deptStats.length} Departments</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deptStats.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{item.department}</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percentage}%`,
                          background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease-in-out',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Semester Breakdown */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#10b981" /> Semester Distribution
              </h3>
              <span className="badge badge-gray">1 - 8 Semesters</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const found = semStats.find((s) => s.semester === sem);
                const count = found ? found.count : 0;
                return (
                  <div
                    key={sem}
                    style={{
                      background: count > 0 ? '#eff6ff' : '#f8fafc',
                      border: `1px solid ${count > 0 ? '#bfdbfe' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '0.85rem 0.5rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sem {sem}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: count > 0 ? '#1d4ed8' : '#94a3b8' }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recently Registered Students Section */}
      {recentStudents.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#f59e0b" /> Recently Registered Students
            </h3>
            <Link to="/students" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              View all
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Registered On</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((st) => (
                  <tr key={st._id}>
                    <td><span className="badge badge-blue">{st.studentId}</span></td>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td><span className="badge badge-gray">{st.department}</span></td>
                    <td><span className="badge badge-green">Sem {st.semester}</span></td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(st.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/edit-student/${st._id}`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
