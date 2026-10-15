/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    if (field === 'studentId') {
      message = `Student ID '${err.keyValue[field]}' already exists. Please use a unique Student ID.`;
    } else if (field === 'email') {
      message = `Email address '${err.keyValue[field]}' is already registered. Please use a unique email.`;
    } else {
      message = `Duplicate value for field '${field}'. Record already exists.`;
    }
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((item) => item.message);
    message = errors.join('. ');
  }

  // Handle Invalid Mongoose ObjectId CastError
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid student record identifier format.';
  }

  // Log error internally (without exposing secrets)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${statusCode} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
