import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, ArrowLeft } from 'lucide-react';
import StudentForm from '../components/StudentForm';
import { studentApi } from '../api/studentApi';
import { useToast } from '../components/Toast';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [student, setStudent] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStudent = async () => {
      setIsLoadingData(true);
      try {
        const res = await studentApi.getStudentById(id);
        if (isMounted && res?.data) {
          setStudent(res.data);
        }
      } catch (err) {
        showToast(err.message, 'error');
        navigate('/students');
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };

    fetchStudent();
    return () => {
      isMounted = false;
    };
  }, [id, navigate, showToast]);

  const handleUpdateStudent = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await studentApi.updateStudent(id, formData);
      if (res?.success) {
        showToast(res.message || 'Student details updated successfully!', 'success');
        navigate('/students');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p className="state-title">Loading student record for editing...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="page-title">Edit Student Information</h2>
          <p className="page-subtitle">
            Update student enrollment data in MongoDB Atlas
          </p>
        </div>
      </div>

      <div className="card form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '42px', height: '42px' }}>
            <Edit2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editing Student: {student?.name}</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Student ID: {student?.studentId} (Unique identifier)</p>
          </div>
        </div>

        <StudentForm
          initialData={student}
          onSubmit={handleUpdateStudent}
          isLoading={isSubmitting}
          isEdit={true}
        />
      </div>
    </div>
  );
};

export default EditStudent;
