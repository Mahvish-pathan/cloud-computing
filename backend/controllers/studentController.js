const mongoose = require('mongoose');
const Student = require('../models/Student');
const { getDBStatus } = require('../config/db');

/**
 * @desc   Health check endpoint
 * @route  GET /api/health
 */
const getHealth = async (req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'Backend service and MongoDB are healthy' : 'Database connection not ready',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      targetDb: 'studentDB',
    },
    environment: process.env.NODE_ENV || 'development',
  });
};

/**
 * @desc   Get all students with search, filters, sorting, and pagination
 * @route  GET /api/students
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      search = '',
      department,
      semester,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by department if provided
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by semester if provided
    if (semester && semester !== 'All') {
      const semNum = parseInt(semester, 10);
      if (!isNaN(semNum)) {
        query.semester = semNum;
      }
    }

    // Search by student ID, name, or email
    if (search && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitized, 'i');
      query.$or = [
        { studentId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Allowed sort fields to prevent unsafe queries
    const allowedSortFields = ['studentId', 'name', 'email', 'department', 'semester', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    const [total, students] = await Promise.all([
      Student.countDocuments(query),
      Student.find(query).sort(sortObj).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: pageNum,
      totalPages,
      limit: limitNum,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get dashboard statistics
 * @route  GET /api/students/stats
 */
const getStudentStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();

    // Department breakdown
    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Semester breakdown
    const semesterStats = await Student.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 5 Most recently registered students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('studentId name department semester createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        departmentStats: departmentStats.map((d) => ({
          department: d._id,
          count: d.count,
        })),
        semesterStats: semesterStats.map((s) => ({
          semester: s._id,
          count: s.count,
        })),
        recentStudents,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Search student by studentId or general query
 * @route  GET /api/students/search
 */
const searchStudent = async (req, res, next) => {
  try {
    const { studentId, query } = req.query;
    const searchTerm = (studentId || query || '').trim();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a student ID or search keyword to query',
      });
    }

    // Try finding exact match by studentId first, then by ObjectId if valid
    let student = await Student.findOne({ studentId: searchTerm.toUpperCase() });

    if (!student && mongoose.Types.ObjectId.isValid(searchTerm)) {
      student = await Student.findById(searchTerm);
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student record found matching '${searchTerm}'`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record found',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single student by MongoDB document ID or studentId
 * @route  GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }

    // Fallback: search by studentId if not found as ObjectId
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID '${id}'`,
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new student record
 * @route  POST /api/students
 */
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Early validation for missing fields
    if (!studentId || !name || !email || !department || semester === undefined || !contact) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: studentId, name, email, department, semester, contact',
      });
    }

    const student = await Student.create({
      studentId: studentId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      semester: Number(semester),
      contact: contact.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update student record
 * @route  PUT /api/students/:id
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId, name, email, department, semester, contact } = req.body;

    let student = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with identifier '${id}'`,
      });
    }

    if (studentId !== undefined) student.studentId = studentId.trim().toUpperCase();
    if (name !== undefined) student.name = name.trim();
    if (email !== undefined) student.email = email.trim().toLowerCase();
    if (department !== undefined) student.department = department.trim();
    if (semester !== undefined) student.semester = Number(semester);
    if (contact !== undefined) student.contact = contact.trim();

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student details updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete student record
 * @route  DELETE /api/students/:id
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findByIdAndDelete(id);
    } else {
      student = await Student.findOneAndDelete({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student record not found with ID '${id}'`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  getStudents,
  getStudentStats,
  searchStudent,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
