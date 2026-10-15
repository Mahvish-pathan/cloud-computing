const express = require('express');
const router = express.Router();
const {
  getHealth,
  getStudents,
  getStudentStats,
  searchStudent,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

// Health check
router.get('/health', getHealth);

// Specialized endpoints (must precede :id route)
router.get('/students/stats', getStudentStats);
router.get('/students/search', searchStudent);

// Main Student CRUD endpoints
router.route('/students')
  .get(getStudents)
  .post(createStudent);

router.route('/students/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
