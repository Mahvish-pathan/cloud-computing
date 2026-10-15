import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Business Administration',
];

const StudentForm = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    semester: '1',
    contact: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId || '',
        name: initialData.name || '',
        email: initialData.email || '',
        department: initialData.department || '',
        semester: initialData.semester ? String(initialData.semester) : '1',
        contact: initialData.contact || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (!/^[A-Za-z0-9-_]+$/.test(formData.studentId.trim())) {
      newErrors.studentId = 'Alphanumeric characters, dashes, or underscores only';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@college.edu)';
    }

    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }

    const semNum = Number(formData.semester);
    if (!formData.semester || isNaN(semNum) || semNum < 1 || semNum > 8) {
      newErrors.semester = 'Semester must be between 1 and 8';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!phoneRegex.test(formData.contact.trim())) {
      newErrors.contact = 'Please enter a valid phone number (10-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'studentId' ? value.toUpperCase() : value,
    }));

    // Clear error for field once edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      semester: Number(formData.semester),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        {/* Student ID */}
        <div className="form-group">
          <label className="form-label" htmlFor="studentId">
            Student ID <span className="required-star">*</span>
          </label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            className={`form-control ${errors.studentId ? 'is-invalid' : ''}`}
            placeholder="e.g. STU101"
            value={formData.studentId}
            onChange={handleChange}
            disabled={isLoading || isEdit}
            required
          />
          {errors.studentId && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.studentId}
            </span>
          )}
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name <span className="required-star">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="e.g. Alexander Pierce"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {errors.name && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.name}
            </span>
          )}
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address <span className="required-star">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="e.g. alex.pierce@college.edu"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {errors.email && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.email}
            </span>
          )}
        </div>

        {/* Contact Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="contact">
            Contact Number <span className="required-star">*</span>
          </label>
          <input
            id="contact"
            name="contact"
            type="tel"
            className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
            placeholder="e.g. +1 555-019-2834"
            value={formData.contact}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {errors.contact && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.contact}
            </span>
          )}
        </div>

        {/* Department */}
        <div className="form-group">
          <label className="form-label" htmlFor="department">
            Department <span className="required-star">*</span>
          </label>
          <select
            id="department"
            name="department"
            className={`form-control ${errors.department ? 'is-invalid' : ''}`}
            value={formData.department}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            <option value="">-- Select Department --</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.department}
            </span>
          )}
        </div>

        {/* Semester */}
        <div className="form-group">
          <label className="form-label" htmlFor="semester">
            Semester (1 - 8) <span className="required-star">*</span>
          </label>
          <select
            id="semester"
            name="semester"
            className={`form-control ${errors.semester ? 'is-invalid' : ''}`}
            value={formData.semester}
            onChange={handleChange}
            disabled={isLoading}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                Semester {num}
              </option>
            ))}
          </select>
          {errors.semester && (
            <span className="form-error">
              <AlertCircle size={14} /> {errors.semester}
            </span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/students')}
          disabled={isLoading}
        >
          <ArrowLeft size={16} /> Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          <Save size={16} />
          {isLoading ? 'Saving Record...' : isEdit ? 'Update Student' : 'Save Student'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
