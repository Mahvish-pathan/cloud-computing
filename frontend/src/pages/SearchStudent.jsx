import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  Calendar,
  Database,
  Edit2,
  Trash2,
} from 'lucide-react';
import { studentApi } from '../api/studentApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

const SearchStudent = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [student, setStudent] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      showToast('Please enter a student ID or MongoDB Document ID to search', 'error');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setStudent(null);

    try {
      const res = await studentApi.searchStudent(query);
      if (res?.success) {
        setStudent(res.data);
      }
    } catch (err) {
      setStudent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!student) return;
    setIsDeleting(true);
    try {
      const id = student._id || student.studentId;
      const res = await studentApi.deleteStudent(id);
      if (res?.success) {
        showToast(res.message || 'Student deleted successfully', 'success');
        setStudent(null);
        setShowDeleteModal(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="page-title">Search Student Records</h2>
          <p className="page-subtitle">
            Look up individual student profiles by Student ID (e.g. ST101) or MongoDB ObjectId
          </p>
        </div>
      </div>

      {/* Search Input Card */}
      <div className="card" style={{ maxWidth: '650px', margin: '0 auto 2rem auto' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.95rem' }}
              placeholder="Enter Student ID (e.g. ST101) or MongoDB ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ height: '44px', minWidth: '120px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="state-container">
          <div className="spinner" />
          <p className="state-title">Querying MongoDB Atlas...</p>
        </div>
      )}

      {/* No Record Found State */}
      {!isLoading && hasSearched && !student && (
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="state-container">
            <div className="state-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <UserX size={32} />
            </div>
            <h3 className="state-title">No Matching Record Found</h3>
            <p className="state-text">
              We could not find any student with ID <strong>"{searchTerm}"</strong> in the database.
              Verify the ID format or register a new student.
            </p>
            <Link to="/add-student" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Register This Student
            </Link>
          </div>
        </div>
      )}

      {/* Student Record Card */}
      {!isLoading && student && (
        <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '56px', height: '56px' }}>
                <UserCheck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{student.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{student.studentId}</span>
                  <span className="badge badge-gray">{student.department}</span>
                  <span className="badge badge-green">Semester {student.semester}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/edit-student/${student._id}`} className="btn btn-outline btn-sm">
                <Edit2 size={15} color="#2563eb" /> Edit
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 size={15} color="#ef4444" /> Delete
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Mail size={18} color="#2563eb" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email Address</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Phone size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact Number</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.contact}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <GraduationCap size={18} color="#9333ea" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Department</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.department}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Layers size={18} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Semester</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Semester {student.semester}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Calendar size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Enrollment Date</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {new Date(student.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px' }}>
              <Database size={18} color="#64748b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MongoDB Document ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                  {student._id}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${student?.name} (${student?.studentId})?`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
        danger={true}
      />
    </div>
  );
};

export default SearchStudent;
