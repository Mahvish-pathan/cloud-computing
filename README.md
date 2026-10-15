# Student Information Management System (SIMS)
### Three-Tier Cloud Architecture: Netlify + Render + MongoDB Atlas

A modern, responsive, production-ready **Student Information Management System (CRUD application)** built following a decoupled **Three-Tier Cloud Architecture**. This project is specifically designed for college academic projects, cloud computing laboratory coursework, and full-stack cloud deployment demonstrations.

---

## 📑 Table of Contents
1. [Three-Tier Architecture Overview](#1-three-tier-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Data Model Specification](#4-student-data-model)
5. [REST API Documentation & curl Examples](#5-rest-api-documentation)
6. [Local Development Setup](#6-local-development-setup)
7. [Step-by-Step MongoDB Atlas Setup Guide](#7-mongodb-atlas-setup-guide)
8. [Step-by-Step Render Deployment Guide (Backend)](#8-render-backend-deployment-guide)
9. [Step-by-Step Netlify Deployment Guide (Frontend)](#9-netlify-frontend-deployment-guide)
10. [Automated & Manual Testing Guide](#10-testing-guide)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Security, Reliability & Academic Disclaimers](#12-security-and-academic-disclaimer)

---

## 1. Three-Tier Architecture Overview

The system strictly decouples concerns across three independent, scalable cloud tiers:

```mermaid
flowchart TD
    subgraph Tier1["Tier 1: Presentation Tier (Client)"]
        A["React.js (Vite) + React Router + Lucide Icons"]
        A1["Hosted on: Netlify CDN"]
    end

    subgraph Tier2["Tier 2: Application Tier (Logic)"]
        B["Node.js + Express.js REST API"]
        B1["Hosted on: Render Web Service"]
        B2["Security: Helmet, CORS, Input Validation, Error Handling"]
    end

    subgraph Tier3["Tier 3: Data Tier (Storage)"]
        C["MongoDB Atlas Cloud Cluster"]
        C1["Database: studentDB"]
        C2["Collection: students"]
    end

    User(["End User (Browser / Mobile)"]) -->|HTTPS Request| A1
    A1 --> A
    A -->|HTTPS REST API Calls Axios| B1
    B1 --> B
    B -->|Mongoose TLS Connection| C
```

| Tier | Component | Cloud Provider | Purpose |
|---|---|---|---|
| **Tier 1: Presentation** | React.js SPA (Vite) | **Netlify** | User interface, responsive dashboard, client validation, student management forms, dynamic statistics. |
| **Tier 2: Application** | Node.js + Express.js | **Render Web Service** | Business logic, request validation, CORS restriction, REST endpoints, centralized error handling. |
| **Tier 3: Data** | MongoDB Atlas Cluster | **MongoDB Atlas** | Managed NoSQL cloud database (`studentDB`), indexed unique constraints (`studentId`, `email`). |

---

## 2. Technology Stack

### Frontend (Presentation Tier)
- **Framework:** React.js 18 with Vite
- **Routing:** React Router v6
- **Styling:** Modern CSS3 design system (professional blue/white palette, responsive layout, cards, custom modal dialogs, status pills)
- **Icons:** Lucide React
- **HTTP Client:** Axios with response interceptors and unified error extraction

### Backend (Application Tier)
- **Runtime:** Node.js (v20+ LTS)
- **Web Framework:** Express.js
- **Database ODM:** Mongoose (v8+)
- **Security:** Helmet (secure HTTP headers), CORS origin filtering, request size limits (1MB)
- **Configuration:** dotenv
- **Testing:** Node.js native test runner (`node --test`) and Supertest

### Database (Data Tier)
- **Database:** MongoDB Atlas (Cloud M0 Free Tier / Dedicated)
- **Database Name:** `studentDB`
- **Collection Name:** `students`

---

## 3. Project Directory Structure

```text
c:\cloud computing/
├── .gitignore                   # Root gitignore (excludes node_modules, .env, build output)
├── netlify.toml                 # Netlify deployment configuration & SPA redirects
├── render.yaml                  # Render Infrastructure-as-Code blueprint
├── package.json                 # Monorepo management helper scripts
├── README.md                    # Comprehensive documentation
│
├── backend/                     # TIER 2: APPLICATION TIER
│   ├── .env.example             # Backend environment variables template
│   ├── .gitignore               # Backend gitignore
│   ├── package.json             # Backend dependencies and scripts
│   ├── server.js                # Express app entry point, middleware, routes mounting
│   ├── config/
│   │   └── db.js                # MongoDB Atlas connection & status checking
│   ├── models/
│   │   └── Student.js           # Mongoose Student schema, regex validations & indexes
│   ├── routes/
│   │   └── studentRoutes.js     # REST API route definitions
│   ├── controllers/
│   │   └── studentController.js # CRUD handlers, aggregation stats, search logic
│   ├── middleware/
│   │   ├── errorHandler.js      # Centralized error handler (code 11000 duplicate keys, cast errors)
│   │   └── notFound.js          # 404 route handler
│   └── tests/
│       └── api.test.js          # Automated integration & schema validation test suite
│
└── frontend/                    # TIER 1: PRESENTATION TIER
    ├── .env.example             # Frontend environment variables template
    ├── .gitignore               # Frontend gitignore
    ├── index.html               # HTML5 entry with Inter font & SVG favicon
    ├── package.json             # Frontend dependencies & scripts
    ├── vite.config.js           # Vite development and build configuration
    ├── public/
    │   └── _redirects           # Netlify SPA redirect rules (/* /index.html 200)
    └── src/
        ├── App.jsx              # Main app shell & React Router routes
        ├── index.css            # Responsive dashboard styles & variables
        ├── main.jsx             # React entry point
        ├── api/
        │   └── studentApi.js    # Centralized Axios API service
        ├── components/
        │   ├── ConfirmDialog.jsx# Accessible confirmation modal for delete actions
        │   ├── Navbar.jsx       # Top navbar with live Atlas connection indicator
        │   ├── Sidebar.jsx      # Sidebar navigation & tier badge
        │   ├── StudentForm.jsx  # Reusable validated form for Create and Edit
        │   ├── StudentTable.jsx # Responsive table with badges and action buttons
        │   └── Toast.jsx        # Toast notification system (success, error, info)
        └── pages/
            ├── AddStudent.jsx   # Register new student page
            ├── Dashboard.jsx    # Real-time statistics, progress bars, recent students
            ├── EditStudent.jsx  # Edit existing student details
            ├── SearchStudent.jsx# Single student search by ID or Mongo document ID
            └── StudentList.jsx  # Table view with search, multi-filter, sort & pagination
```

---

## 4. Student Data Model

The student record is stored in MongoDB Atlas under the database `studentDB` and collection `students`:

```javascript
{
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[A-Za-z0-9-_]+$/
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  department: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication',
      'Electrical & Electronics',
      'Mechanical Engineering',
      'Civil Engineering',
      'Artificial Intelligence & Data Science',
      'Business Administration'
    ]
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  contact: {
    type: String,
    required: true,
    trim: true,
    match: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/
  },
  createdAt: Date, // Automatic timestamp
  updatedAt: Date  // Automatic timestamp
}
```

---

## 5. REST API Documentation

### Base URL:
- Local Development: `http://localhost:5000`
- Production (Render): `https://<your-render-service-name>.onrender.com`

### Endpoints Overview

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | API Information and documentation links | 200 |
| `GET` | `/api/health` | Backend and MongoDB Atlas connectivity status | 200, 503 |
| `GET` | `/api/students` | Get all students (search, filter, pagination, sort) | 200, 500 |
| `GET` | `/api/students/stats` | Aggregated dashboard enrollment statistics | 200, 500 |
| `GET` | `/api/students/search` | Search student by studentId or keyword query | 200, 400, 404 |
| `GET` | `/api/students/:id` | Get student by MongoDB ObjectId or studentId | 200, 400, 404 |
| `POST` | `/api/students` | Create new student record | 201, 400, 409 |
| `PUT` | `/api/students/:id` | Update existing student record | 200, 400, 404, 409 |
| `DELETE` | `/api/students/:id` | Delete student record | 200, 400, 404 |

---

### Example cURL Requests

#### 1. System Health Check
```bash
curl -X GET http://localhost:5000/api/health
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Backend service and MongoDB are healthy",
  "timestamp": "2026-10-15T06:50:00.000Z",
  "uptime": 124.5,
  "database": {
    "status": "connected",
    "targetDb": "studentDB"
  },
  "environment": "development"
}
```

#### 2. Create Student Record (POST)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "ST101",
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "department": "Computer Science & Engineering",
    "semester": 5,
    "contact": "+1-555-019-2834"
  }'
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "_id": "670e28f323e4a90b84c8e11a",
    "studentId": "ST101",
    "name": "Jane Doe",
    "email": "jane.doe@college.edu",
    "department": "Computer Science & Engineering",
    "semester": 5,
    "contact": "+1-555-019-2834",
    "createdAt": "2026-10-15T06:52:00.000Z",
    "updatedAt": "2026-10-15T06:52:00.000Z"
  }
}
```

#### 3. Duplicate Key Conflict (409 Conflict)
Attempting to create another student with `studentId: "ST101"` or `email: "jane.doe@college.edu"`:
```json
{
  "success": false,
  "message": "Student ID 'ST101' already exists. Please use a unique Student ID."
}
```

#### 4. Retrieve Students with Filters & Pagination (GET)
```bash
curl -X GET "http://localhost:5000/api/students?department=Computer+Science+%26+Engineering&page=1&limit=10"
```
**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "limit": 10,
  "data": [ ... ]
}
```

#### 5. Search Student by ID (GET)
```bash
curl -X GET "http://localhost:5000/api/students/search?studentId=ST101"
```

#### 6. Update Student Semester from 5 to 6 (PUT)
```bash
curl -X PUT http://localhost:5000/api/students/ST101 \
  -H "Content-Type: application/json" \
  -d '{
    "semester": 6
  }'
```

#### 7. Delete Student (DELETE)
```bash
curl -X DELETE http://localhost:5000/api/students/ST101
```

---

## 6. Local Development Setup

### Prerequisites
- Node.js (v18 or v20+ LTS)
- npm (v9+)
- A MongoDB Atlas connection string (or local MongoDB)

### Step 1: Clone the repository
```bash
git clone https://github.com/<your-username>/student-management-system.git
cd student-management-system
```

### Step 2: Configure Backend Environment
```bash
cd backend
copy .env.example .env
```
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/studentDB?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```
Install backend dependencies and run tests:
```bash
npm install
npm test
npm run dev
```
The backend server will run on `http://localhost:5000`.

### Step 3: Configure Frontend Environment
In a new terminal window:
```bash
cd frontend
copy .env.example .env
```
Verify `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```
Install frontend dependencies and run development server:
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. MongoDB Atlas Setup Guide

Follow these steps to configure your **Tier 3 Data Tier**:

### Step 1: Sign up & Create Cluster
1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create** and select **M0 Free (Shared)** tier.
3. Choose your nearest cloud provider region (e.g. AWS / us-east-1).
4. Name your cluster (e.g. `Cluster0`) and click **Create Deployment**.

### Step 2: Create Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set a username (e.g. `studentAdmin`) and a strong password (e.g. `AtlasSecurePass2026`).
5. Built-in Role: **Read and write to any database**.
6. Click **Add User**.
> **Important:** If your password contains special characters like `@`, `#`, `:`, or `/`, percent-encode them or use alphanumeric characters to avoid URI connection errors.

### Step 3: Configure Network Access (IP Whitelist)
1. In the left sidebar, click **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access From Anywhere** (`0.0.0.0/0`).
   > *Why?* Render Web Service uses dynamic cloud IP addresses that change on each deploy. `0.0.0.0/0` is required so Render can connect to your Atlas cluster.
4. Set description: `Allow Render backend`.
5. Click **Confirm**.

### Step 4: Obtain Connection String
1. Under **Deployments**, click **Database**.
2. Click the **Connect** button next to your cluster.
3. Choose **Drivers** (Node.js).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with the credentials created in Step 2.
6. Specify the database name `studentDB` right before the query parameters:
   ```text
   mongodb+srv://studentAdmin:AtlasSecurePass2026@cluster0.xxxxxx.mongodb.net/studentDB?retryWrites=true&w=majority
   ```
7. This string will be saved in your Render Environment Variables (and `backend/.env` for local testing).

---

## 8. Render Backend Deployment Guide

Deploy your **Tier 2 Application Tier** to Render:

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "feat: complete three-tier student management system"
git branch -M main
git remote add origin https://github.com/<your-username>/student-management-system.git
git push -u origin main
```

### Step 2: Create Render Web Service
1. Log in to [Render.com](https://render.com).
2. On your dashboard, click **New +** -> **Web Service**.
3. Connect your GitHub repository: `student-management-system`.
4. Configure the service settings:
   - **Name:** `student-management-backend` (or similar)
   - **Region:** Choose region closest to your MongoDB Atlas cluster (e.g. Oregon or Frankfurt)
   - **Root Directory:** `backend` *(Crucial for monorepo structure)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Configure Environment Variables in Render
In the **Environment Variables** section on Render, add:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security and disables stack traces |
| `PORT` | `10000` | Render standard port |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.xxxxxx.mongodb.net/studentDB?retryWrites=true&w=majority` | Connection string from Atlas |
| `FRONTEND_URL` | `https://your-temporary-name.netlify.app` *(update after Netlify deploy)* | Permitted CORS origin |

### Step 4: Deploy and Verify
1. Click **Create Web Service**. Render will install dependencies and start the Node process.
2. Wait for the log:
   ```text
   ✅ MongoDB Connected successfully: cluster0.../studentDB
   🚀 Server running in production mode on port 10000
   ```
3. Copy your live Render URL (e.g. `https://student-management-backend-xxxx.onrender.com`).
4. Test the live health endpoint in your browser or curl:
   ```bash
   curl https://student-management-backend-xxxx.onrender.com/api/health
   ```
   Verify that `"database": { "status": "connected" }` is returned.

---

## 9. Netlify Frontend Deployment Guide

Deploy your **Tier 1 Presentation Tier** to Netlify:

### Step 1: Create New Site from Git
1. Log in to [Netlify.com](https://netlify.com).
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize your repository `student-management-system`.

### Step 2: Configure Build Settings
Netlify will read `netlify.toml` automatically, but verify the following settings:
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist` (or `dist` relative to base)

### Step 3: Configure Frontend Environment Variables
Under **Site configuration** -> **Environment variables**, click **Add a variable**:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://student-management-backend-xxxx.onrender.com` |

*(Use the exact URL generated by Render from Section 8, without trailing slash).*

### Step 4: Deploy Site
1. Click **Deploy student-management-system**.
2. Netlify builds the Vite bundle and provisions a global CDN URL (e.g. `https://edutrack-student-system.netlify.app`).
3. Click your live Netlify URL and verify:
   - Dashboard loads with live status indicator showing **Atlas Connected**.
   - Navigation to `/students`, `/add-student`, `/search` works smoothly without 404 errors on browser reload (handled by `_redirects`).

### Step 5: Update CORS Origin in Render
1. Return to your [Render Dashboard](https://dashboard.render.com).
2. Go to your backend service -> **Environment**.
3. Update `FRONTEND_URL` to your actual Netlify domain:
   ```text
   FRONTEND_URL=https://edutrack-student-system.netlify.app
   ```
4. Click **Save Changes**. Render will automatically redeploy the backend with the updated CORS policy.

---

## 10. Testing Guide

### Automated Test Suite
The backend contains 17 automated unit and integration tests covering:
- Backend health check API
- 404 route handling
- Student model schema validation
- Duplicate Student ID detection (code 11000 -> 409 Conflict)
- Duplicate Email detection (code 11000 -> 409 Conflict)
- Invalid email address format rejection
- Missing required fields validation
- Semester range validation (1-8)
- Department enum constraint
- CORS policy origin filtering

Run the test suite anytime using:
```bash
npm run test:backend
# or from backend folder:
cd backend
npm test
```

### Manual CRUD Verification Checklist
| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/add-student` | Form renders with empty fields and default Semester 1. |
| 2 | Submit empty form | Validation errors highlight required fields. Form is not submitted. |
| 3 | Enter invalid email `user@bad` | Form flags invalid email format. |
| 4 | Fill valid student details and submit | Green toast notification: "Student enrolled successfully!". Redirects to `/students`. |
| 5 | Submit identical Student ID or Email | Red toast notification: "Student ID '...' already exists." (409 Conflict). |
| 6 | View `/students` list | Student record is present in table with badges and contact details. |
| 7 | Search student by ID or name | Filter instantly updates table with matching records. |
| 8 | Filter by Department & Semester | Table filters to matching subset. |
| 9 | Click "Edit" icon on student row | Form pre-populates current student data. Student ID field is protected. |
| 10 | Update semester (e.g. from 5 to 6) and save | Success notification appears. Semester badge updates to "Sem 6". |
| 11 | Navigate to `/search` and look up student | Profile card renders complete information including MongoDB document ID. |
| 12 | Click "Delete" button | Confirmation modal asks for confirmation before action. |
| 13 | Confirm deletion | Student record is deleted. Table and Dashboard counters refresh immediately. |
| 14 | Open `/` Dashboard | Dynamic statistics recalculate; empty state displays when 0 records exist. |

---

## 11. Troubleshooting Guide

### Issue 1: CORS Error in Browser Console (`Access-Control-Allow-Origin`)
- **Symptoms:** Frontend Axios requests fail with `CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource`.
- **Causes & Fixes:**
  1. The Render backend does not have `FRONTEND_URL` set to your exact Netlify domain. Open Render -> Environment Variables and ensure `FRONTEND_URL` matches your Netlify domain (e.g. `https://your-site.netlify.app` without trailing slash).
  2. If testing locally, ensure backend is running with `NODE_ENV=development` or `FRONTEND_URL=http://localhost:5173`.

### Issue 2: Backend Fails to Connect to MongoDB Atlas (`MongooseServerSelectionError`)
- **Symptoms:** Backend logs show `MongoDB Connection Error: connection timed out` or `/api/health` reports status `disconnected`.
- **Causes & Fixes:**
  1. **IP Whitelist:** In MongoDB Atlas, verify **Network Access** includes `0.0.0.0/0` (Allow access from anywhere). Render instances do not have fixed IPs.
  2. **Credentials:** Check your database username and password in `MONGODB_URI`. If your password has symbols like `@` or `#`, encode them (e.g., `@` becomes `%40`) or reset the password to alphanumeric characters.
  3. **Database Name:** Verify your URI includes `/studentDB?retryWrites=true&w=majority`.

### Issue 3: Page Not Found (404) on Refreshing Netlify Routes
- **Symptoms:** Navigating to `https://your-site.netlify.app/students` works, but refreshing the page shows "Page Not Found".
- **Causes & Fixes:** Single Page Applications (SPAs) route client-side. The file `frontend/public/_redirects` contains `/* /index.html 200`, which instructs Netlify to serve `index.html` on all subpaths. Ensure this file is present and published.

### Issue 4: Render Free Tier Cold Starts
- **Symptoms:** The first request to the Render API takes 30-50 seconds to respond.
- **Cause:** Render free tier spins down inactive web services after 15 minutes. Once a new request arrives, it spins up within ~30 seconds. The frontend Axios timeout is configured for resilience, and subsequent requests will be instantaneous.

---

## 12. Security and Academic Disclaimer

### Security Measures Implemented
- **No Hardcoded Secrets:** No MongoDB Atlas connection strings or credentials are committed to GitHub or exposed in frontend bundles.
- **Parameterized Mongoose Queries:** All queries utilize sanitized Mongoose operations to eliminate NoSQL injection risks.
- **Strict Input Validation:** Backend validates types, ranges (semester 1-8), email formats, and string lengths before persisting to Atlas.
- **HTTP Security Headers:** Integrated Helmet middleware protects against cross-site scripting (XSS), MIME sniffing, and clickjacking.
- **Centralized Error Handling:** Internal stack traces and database connection URLs are masked when `NODE_ENV=production`.

### Academic Project Notice
> [!NOTE]
> This application is built as an academic demonstration of a **Three-Tier Cloud Deployment**. In this educational version, user authentication (e.g., JWT / OAuth) is omitted to simplify grading and evaluation. Consequently, the CRUD REST endpoints are publicly accessible to anyone with network access to the API. Do not use this application to store sensitive personal identification numbers (e.g., Social Security Numbers or real academic transcripts). CORS restricts browser origins but should not be treated as an authentication or authorization mechanism.
