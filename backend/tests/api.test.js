const assert = require('assert');
const test = require('node:test');
const request = require('supertest');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const errorHandler = require('../middleware/errorHandler');

// We require server without starting duplicate listener
process.env.PORT = '5001';
process.env.NODE_ENV = 'development';
const app = require('../server');

test('Backend Health & Error Handling Test Suite', async (t) => {
  await t.test('GET /api/health should respond with valid health payload', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.body.hasOwnProperty('success'));
    assert.ok(res.body.hasOwnProperty('database'));
    assert.ok(res.body.database.hasOwnProperty('status'));
    assert.strictEqual(res.body.database.targetDb, 'studentDB');
  });

  await t.test('GET /unknown-route should return 404 with standard JSON format', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Resource not found'));
  });

  await t.test('POST /api/students with missing fields should reject with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/students')
      .send({ name: 'John Doe' }); // Missing studentId, email, etc.

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('All fields are required'));
  });

  await t.test('GET /api/students/search without params should reject with 400 Bad Request', async () => {
    const res = await request(app).get('/api/students/search');
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('Please provide a student ID or search keyword'));
  });
});

test('Student Model Schema & Validation Test Suite', async (t) => {
  await t.test('Valid student document should pass schema validation', async () => {
    const validStudent = new Student({
      studentId: 'ST101',
      name: 'Jane Doe',
      email: 'jane.doe@college.edu',
      department: 'Computer Science & Engineering',
      semester: 5,
      contact: '+1-555-019-2834',
    });

    const error = validStudent.validateSync();
    assert.strictEqual(error, undefined, 'Valid student should have no validation errors');
    assert.strictEqual(validStudent.studentId, 'ST101');
    assert.strictEqual(validStudent.email, 'jane.doe@college.edu');
  });

  await t.test('Reject invalid email format', async () => {
    const student = new Student({
      studentId: 'ST102',
      name: 'Bad Email Student',
      email: 'not-a-valid-email',
      department: 'Computer Science & Engineering',
      semester: 3,
      contact: '5551234567',
    });

    const error = student.validateSync();
    assert.ok(error, 'Should have validation errors');
    assert.ok(error.errors.email, 'Should flag invalid email');
    assert.ok(error.errors.email.message.includes('valid email address'));
  });

  await t.test('Reject missing required fields', async () => {
    const emptyStudent = new Student({});
    const error = emptyStudent.validateSync();

    assert.ok(error, 'Should fail validation when required fields are missing');
    assert.ok(error.errors.studentId, 'studentId is required');
    assert.ok(error.errors.name, 'name is required');
    assert.ok(error.errors.email, 'email is required');
    assert.ok(error.errors.department, 'department is required');
    assert.ok(error.errors.semester, 'semester is required');
    assert.ok(error.errors.contact, 'contact is required');
  });

  await t.test('Reject semester outside 1 to 8 range', async () => {
    const studentLow = new Student({
      studentId: 'ST103',
      name: 'Semester Zero',
      email: 'zero@college.edu',
      department: 'Information Technology',
      semester: 0,
      contact: '1234567890',
    });
    const errorLow = studentLow.validateSync();
    assert.ok(errorLow.errors.semester);

    const studentHigh = new Student({
      studentId: 'ST104',
      name: 'Semester Nine',
      email: 'nine@college.edu',
      department: 'Information Technology',
      semester: 9,
      contact: '1234567890',
    });
    const errorHigh = studentHigh.validateSync();
    assert.ok(errorHigh.errors.semester);
  });

  await t.test('Reject unsupported department', async () => {
    const student = new Student({
      studentId: 'ST105',
      name: 'Unknown Dept',
      email: 'dept@college.edu',
      department: 'Astronautics Engineering',
      semester: 4,
      contact: '1234567890',
    });
    const error = student.validateSync();
    assert.ok(error.errors.department);
    assert.ok(error.errors.department.message.includes('not a supported department'));
  });
});

test('Duplicate Key and Centralized Error Handling Test Suite', async (t) => {
  await t.test('Should format code 11000 duplicate studentId as 409 Conflict', () => {
    const duplicateErr = new Error('E11000 duplicate key error');
    duplicateErr.code = 11000;
    duplicateErr.keyValue = { studentId: 'ST101' };

    let capturedStatus = null;
    let capturedBody = null;

    const mockRes = {
      statusCode: 200,
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(body) {
        capturedBody = body;
        return this;
      },
    };

    errorHandler(duplicateErr, {}, mockRes, () => {});

    assert.strictEqual(capturedStatus, 409);
    assert.strictEqual(capturedBody.success, false);
    assert.ok(capturedBody.message.includes("Student ID 'ST101' already exists"));
  });

  await t.test('Should format code 11000 duplicate email as 409 Conflict', () => {
    const duplicateErr = new Error('E11000 duplicate key error');
    duplicateErr.code = 11000;
    duplicateErr.keyValue = { email: 'student@college.edu' };

    let capturedStatus = null;
    let capturedBody = null;

    const mockRes = {
      statusCode: 200,
      status(code) {
        capturedStatus = code;
        return this;
      },
      json(body) {
        capturedBody = body;
        return this;
      },
    };

    errorHandler(duplicateErr, {}, mockRes, () => {});

    assert.strictEqual(capturedStatus, 409);
    assert.strictEqual(capturedBody.success, false);
    assert.ok(capturedBody.message.includes("Email address 'student@college.edu' is already registered"));
  });
});

test('CORS Policy Verification Test Suite', async (t) => {
  await t.test('Should allow request from permitted local origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:5173');
  });

  await t.test('Should allow requests with no origin header (like curl or postman)', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.status === 200 || res.status === 503);
  });
});
