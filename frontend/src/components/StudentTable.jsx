import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Mail, Phone, UserX } from 'lucide-react';

const StudentTable = ({
  students = [],
  isLoading = false,
  onDeleteClick,
}) => {
  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p className="state-title">Loading student records...</p>
        <p className="state-text">Fetching latest data from MongoDB Atlas via REST API</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon">
          <UserX size={28} />
        </div>
        <h3 className="state-title">No Students Found</h3>
        <p className="state-text">
          No records match your search or filter criteria. Try adjusting your query or add a new student.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Contact Info</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id || student.studentId}>
              <td>
                <span className="badge badge-blue">{student.studentId}</span>
              </td>
              <td style={{ fontWeight: 600 }}>{student.name}</td>
              <td>
                <span className="badge badge-gray">{student.department}</span>
              </td>
              <td>
                <span className="badge badge-green">Sem {student.semester}</span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: '#475569' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={12} color="#64748b" /> {student.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={12} color="#64748b" /> {student.contact}
                  </span>
                </div>
              </td>
              <td>
                <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                  <Link
                    to={`/edit-student/${student._id || student.studentId}`}
                    className="btn btn-outline btn-icon"
                    title="Edit Student"
                    aria-label={`Edit ${student.name}`}
                  >
                    <Edit2 size={15} color="#2563eb" />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-icon"
                    title="Delete Student"
                    aria-label={`Delete ${student.name}`}
                    onClick={() => onDeleteClick(student)}
                  >
                    <Trash2 size={15} color="#ef4444" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
