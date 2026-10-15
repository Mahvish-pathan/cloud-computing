const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9-_]+$/, 'Student ID must contain only alphanumeric characters, dashes, or underscores'],
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: [
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics & Communication',
          'Electrical & Electronics',
          'Mechanical Engineering',
          'Civil Engineering',
          'Artificial Intelligence & Data Science',
          'Business Administration',
        ],
        message: '{VALUE} is not a supported department',
      },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/,
        'Please provide a valid contact number (10-15 digits)',
      ],
    },
  },
  {
    timestamps: true,
    collection: 'students',
  }
);

// Index department for fast filtering
studentSchema.index({ department: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
