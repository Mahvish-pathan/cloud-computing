const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated origins if multiple frontend environments are configured
  process.env.FRONTEND_URL.split(',').forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, curl, Postman, or health checks (no origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Root route - Service Overview
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Student Information Management System API (Tier-2)',
    tier: 'Application Tier (Backend)',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      students: 'GET /api/students',
      stats: 'GET /api/students/stats',
      search: 'GET /api/students/search?studentId=:id',
      getStudent: 'GET /api/students/:id',
      createStudent: 'POST /api/students',
      updateStudent: 'PUT /api/students/:id',
      deleteStudent: 'DELETE /api/students/:id',
    },
  });
});

// Mount API routes
app.use('/api', studentRoutes);

// 404 Route handling
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
