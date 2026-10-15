import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import StudentForm from '../components/StudentForm';
import { studentApi } from '../api/studentApi';
import { useToast } from '../components/Toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStudent = async (formData) => {
    setIsLoading(true);
    try {
      const res = await studentApi.createStudent(formData);
      if (res?.success) {
        showToast(res.message || 'Student enrolled successfully!', 'success');
        navigate('/students');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="page-title">Register New Student</h2>
          <p className="page-subtitle">
            Create a new student record in MongoDB Atlas (Tier 3 Data Store)
          </p>
        </div>
      </div>

      <div className="card form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '42px', height: '42px' }}>
            <UserPlus size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Student Information Form</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>All fields marked with an asterisk are required</p>
          </div>
        </div>

        <StudentForm
          onSubmit={handleAddStudent}
          isLoading={isLoading}
          isEdit={false}
        />
      </div>
    </div>
  );
};

export default AddStudent;
