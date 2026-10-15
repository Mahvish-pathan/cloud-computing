import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import StudentTable from '../components/StudentTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { studentApi } from '../api/studentApi';
import { useToast } from '../components/Toast';

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Business Administration',
];

const StudentList = () => {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Deletion modal state
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentApi.getStudents({
        search: searchTerm,
        department: selectedDept,
        semester: selectedSem,
        sortBy,
        sortOrder,
        page: currentPage,
        limit,
      });

      if (res?.success) {
        setStudents(res.data || []);
        setTotalStudents(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDept, selectedSem, sortBy, sortOrder, currentPage, limit, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle Search input with slight debounce effect or on change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
    setCurrentPage(1);
  };

  const handleSemChange = (e) => {
    setSelectedSem(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(':');
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const id = studentToDelete._id || studentToDelete.studentId;
      const res = await studentApi.deleteStudent(id);
      if (res?.success) {
        showToast(res.message || 'Student deleted successfully', 'success');
        setStudentToDelete(null);
        fetchStudents();
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
          <h2 className="page-title">Enrolled Students</h2>
          <p className="page-subtitle">
            Manage student records, filter by academic departments, and update information
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchStudents}
            title="Refresh student list"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinner' : ''} /> Refresh
          </button>
          <Link to="/add-student" className="btn btn-primary">
            <UserPlus size={16} /> Add Student
          </Link>
        </div>
      </div>

      <div className="table-container">
        {/* Toolbar: Search, Filters, Sorting */}
        <div className="table-toolbar">
          <div className="search-box-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID, name, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="filters-wrapper">
            {/* Department Filter */}
            <select
              className="filter-select"
              value={selectedDept}
              onChange={handleDeptChange}
              title="Filter by Department"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Semester Filter */}
            <select
              className="filter-select"
              value={selectedSem}
              onChange={handleSemChange}
              title="Filter by Semester"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              className="filter-select"
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              title="Sort Records"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="name:asc">Name (A-Z)</option>
              <option value="name:desc">Name (Z-A)</option>
              <option value="studentId:asc">Student ID (Asc)</option>
              <option value="studentId:desc">Student ID (Desc)</option>
              <option value="semester:asc">Semester (Low to High)</option>
              <option value="semester:desc">Semester (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <StudentTable
          students={students}
          isLoading={isLoading}
          onDeleteClick={handleDeleteClick}
        />

        {/* Pagination Bar */}
        {!isLoading && totalStudents > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Showing {students.length} of {totalStudents} student{totalStudents !== 1 ? 's' : ''}
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </div>
            <div className="pagination-controls">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete student "${studentToDelete?.name}" (${studentToDelete?.studentId})? This action cannot be undone.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
        isLoading={isDeleting}
        danger={true}
      />
    </div>
  );
};

export default StudentList;
