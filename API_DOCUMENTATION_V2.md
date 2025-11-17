# 📚 KarirKit API Documentation

Dokumentasi lengkap REST API untuk aplikasi KarirKit - Platform AI-powered Career Management.

**Version:** 2.0.0  
**Last Updated:** November 17, 2025  
**Base URL:** `http://localhost:3000` (Development)  
**Authentication:** Bearer Token (JWT)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
  - [Authentication APIs](#authentication-apis)
  - [Profile APIs](#profile-apis)
  - [CV/Resume APIs](#cvresume-apis)
  - [Job Matching APIs](#job-matching-apis)
  - [Salary Benchmark APIs](#salary-benchmark-apis)
  - [Helper APIs](#helper-apis)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Environment Setup](#environment-setup)

---

## 🎯 Overview

KarirKit API menyediakan endpoint untuk:

- ✅ User authentication & profile management
- ✅ CV/Resume upload dan AI analysis
- ✅ Job matching dengan AI recommendations
- ✅ Salary benchmarking dengan vector search
- ✅ Integration dengan Gemini AI, Google Vision, LinkedIn Jobs

**Key Features:**

- RESTful API design
- JWT Bearer token authentication
- AI-powered insights dengan Gemini
- OCR untuk CV images
- Vector search untuk salary benchmarking
- Real-time job matching

---

## 🔐 Authentication

KarirKit menggunakan **JWT Bearer Token** untuk authentication.

### Flow Authentication:

1. **Register** → `POST /api/register`
2. **Login** → `POST /api/login` → Dapatkan `access_token`
3. **Simpan token** di localStorage
4. **Kirim token** via `Authorization: Bearer {token}` untuk protected endpoints

### Request Header Format:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Storage (Client-Side):

```javascript
// Simpan token setelah login
localStorage.setItem("karirkit_access_token", token);

// Ambil token untuk request
const token = localStorage.getItem("karirkit_access_token");

// Hapus token saat logout
localStorage.removeItem("karirkit_access_token");
```

---

## 🚀 Quick Start

### 1. Register User Baru

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### 2. Login & Get Token

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response:**

```json
{
  "message": "User logged in successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Access Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📡 API Endpoints

### 🔐 Authentication APIs

#### 1. Register User

Mendaftarkan user baru ke sistem.

**Endpoint:** `POST /api/register`

**Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-11-17T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields
- `409 Conflict` - Email already registered
- `500 Internal Server Error` - Server error

**Validation Rules:**

- `fullname`: Required, min 2 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters

**Example (JavaScript/Fetch):**

```javascript
const response = await fetch("http://localhost:3000/api/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    fullname: "John Doe",
    email: "john@example.com",
    password: "password123",
  }),
});

const data = await response.json();
```

---

#### 2. Login User

Login untuk mendapatkan JWT access token.

**Endpoint:** `POST /api/login`

**Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**

```json
{
  "message": "User logged in successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAyMDAwMDAsImV4cCI6MTcwMDgwNDgwMH0.xyz123..."
}
```

**Error Responses:**

- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

**Important Notes:**

- Token adalah JWT yang berisi: `userId`, `email`, `iat`, `exp`
- Token default expires dalam 7 hari
- Simpan token di localStorage untuk request selanjutnya
- Token bersifat stateless (server tidak menyimpan session)

**Example (JavaScript/Fetch):**

```javascript
const response = await fetch("http://localhost:3000/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "john@example.com",
    password: "password123",
  }),
});

const data = await response.json();

if (response.ok) {
  // Simpan token
  localStorage.setItem("karirkit_access_token", data.access_token);
  // Redirect ke dashboard
  window.location.href = "/dashboard";
}
```

---

#### 3. Logout User

Logout user (client-side harus hapus token).

**Endpoint:** `POST /api/logout`

**Request Headers:**

```http
None required (endpoint bersifat stateless)
```

**Success Response (200 OK):**

```json
{
  "message": "Logout successful. Please remove token from client storage."
}
```

**Error Responses:**

- `500 Internal Server Error` - Server error

**Important Notes:**

- Endpoint ini optional karena JWT stateless
- Client **wajib** hapus token dari localStorage
- Server tidak menyimpan session, jadi tidak perlu cleanup di server

**Example (JavaScript/Fetch):**

```javascript
// Optional: call logout endpoint
await fetch("http://localhost:3000/api/logout", {
  method: "POST",
});

// Wajib: hapus token dari localStorage
localStorage.removeItem("karirkit_access_token");

// Redirect ke login
window.location.href = "/login";
```

---

### 👤 Profile APIs

#### 1. Get User Profile

Mendapatkan informasi profile user yang sedang login.

**Endpoint:** `GET /api/profile`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**Success Response (200 OK):**

```json
{
  "fullname": "John Doe",
  "email": "john.doe@example.com",
  "image": "https://res.cloudinary.com/karirkit/image/upload/v1234567890/profile.jpg"
}
```

**Error Responses:**

- `401 Unauthorized` - Token missing, invalid, atau expired
- `404 Not Found` - User tidak ditemukan di database
- `500 Internal Server Error` - Server error

**Example (JavaScript/Fetch):**

```javascript
const token = localStorage.getItem("karirkit_access_token");

const response = await fetch("http://localhost:3000/api/profile", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const profile = await response.json();
```

---

#### 2. Update User Profile

Update profile user dan upload gambar profile.

**Endpoint:** `PUT /api/profile`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
fullname: "John Doe Updated"
image: [File] (optional, JPG/PNG, max 10MB)
```

**Success Response (200 OK):**

```json
{
  "message": "Profile updated successfully",
  "image": "https://res.cloudinary.com/karirkit/image/upload/v1234567890/new-profile.jpg"
}
```

**Error Responses:**

- `401 Unauthorized` - Token missing, invalid, atau expired
- `400 Bad Request` - Invalid file format or size
- `500 Internal Server Error` - Server or upload error

**Important Notes:**

- Image di-upload ke Cloudinary
- Supported formats: JPG, PNG, JPEG
- Max file size: 10MB
- Field `image` bersifat optional
- Jika tidak upload image, hanya fullname yang di-update

**Example (JavaScript/Fetch):**

```javascript
const token = localStorage.getItem("karirkit_access_token");
const formData = new FormData();

formData.append("fullname", "John Doe Updated");

// Optional: add image
const fileInput = document.querySelector("#profile-image");
if (fileInput.files[0]) {
  formData.append("image", fileInput.files[0]);
}

const response = await fetch("http://localhost:3000/api/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    // Jangan set Content-Type, browser akan set otomatis dengan boundary
  },
  body: formData,
});

const result = await response.json();
```

---

### 📄 CV/Resume APIs

#### 1. Upload PDF/Image CV

Upload CV dalam format PDF atau image untuk di-extract teksnya.

**Endpoint:** `POST /api/upload-pdf`

**Request Headers:**

```http
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
file: [File] (PDF atau Image, max 10MB)
```

**Success Response (201 Created):**

```json
{
  "message": "PDF/image uploaded and processed successfully",
  "data": {
    "resumeId": "507f1f77bcf86cd799439011",
    "filename": "john-doe-cv.pdf",
    "fileType": "application/pdf",
    "fileSize": 245632,
    "cloudinaryUrl": "https://res.cloudinary.com/karirkit/raw/upload/v1234567890/resumes/cv.pdf",
    "extractedTextLength": 2543,
    "extractedTextPreview": "John Doe\nSoftware Engineer\n\nExperience:\n- Senior Developer at Tech Corp..."
  }
}
```

**Error Responses:**

- `400 Bad Request` - No file uploaded, invalid format, or file too large
- `500 Internal Server Error` - Upload or text extraction failed

**Supported Formats:**

- PDF documents
- Images: JPG, PNG, JPEG

**Processing Flow:**

1. File validation (type & size)
2. Upload to Cloudinary
3. **If PDF:** Send to n8n webhook for text extraction
4. **If Image:** Use Google Vision API for OCR
5. Save extracted text to MongoDB (ResumeModel)
6. Return resumeId for further analysis

**Important Notes:**

- Max file size: 10MB
- Text extraction may take 5-10 seconds
- Resume ID diperlukan untuk analyze CV
- Endpoint ini **tidak perlu authentication**

**Example (JavaScript/Fetch):**

```javascript
const formData = new FormData();
const fileInput = document.querySelector("#cv-file");

formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:3000/api/upload-pdf", {
  method: "POST",
  body: formData,
});

const result = await response.json();
const resumeId = result.data.resumeId; // Simpan untuk analyze
```

---

#### 2. Analyze CV with AI

Analisis CV menggunakan Gemini AI untuk mendapatkan insights.

**Endpoint:** `POST /api/analyze-cv`

**Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "resumeId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200 OK):**

```json
{
  "message": "CV analyzed successfully with Gemini AI",
  "data": {
    "rawText": "John Doe\nSoftware Engineer...",
    "textLength": 2543,
    "analysis": {
      "summary": "Experienced software engineer with 5+ years in full-stack development. Strong background in React, Node.js, and cloud technologies. Demonstrated leadership in team projects and agile environments.",
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+62 812-3456-7890",
        "location": "Jakarta, Indonesia",
        "linkedin": "linkedin.com/in/johndoe"
      },
      "skills": [
        "JavaScript/TypeScript",
        "React.js",
        "Node.js",
        "MongoDB",
        "Python",
        "Docker",
        "AWS",
        "Git"
      ],
      "experience": [
        {
          "company": "Tech Corp Indonesia",
          "position": "Senior Software Engineer",
          "duration": "Jan 2020 - Present",
          "description": "Led development of microservices architecture, mentored junior developers, improved system performance by 40%"
        },
        {
          "company": "Startup Digital",
          "position": "Full Stack Developer",
          "duration": "Jun 2018 - Dec 2019",
          "description": "Built e-commerce platform from scratch, integrated payment gateways, managed database optimization"
        }
      ],
      "education": [
        {
          "institution": "University of Technology",
          "degree": "Bachelor of Computer Science",
          "field": "Software Engineering",
          "year": "2014-2018",
          "gpa": "3.75/4.00"
        }
      ],
      "strengths": [
        "Strong technical skills across modern web technologies",
        "Proven leadership and team collaboration",
        "Experience with cloud infrastructure and DevOps",
        "Good problem-solving and analytical thinking"
      ],
      "recommendations": [
        "Consider adding cloud certifications (AWS, Azure)",
        "Include specific metrics in project achievements",
        "Add portfolio links or GitHub projects",
        "Highlight any open-source contributions"
      ]
    },
    "source": "gemini-ai"
  }
}
```

**Error Responses:**

- `400 Bad Request` - resumeId missing or no text found in resume
- `404 Not Found` - Resume not found in database
- `500 Internal Server Error` - AI analysis failed

**Important Notes:**

- Requires valid `resumeId` from upload-pdf endpoint
- Uses Gemini 1.5 Flash model for analysis
- Fallback to mock data if Gemini fails
- Analysis includes: summary, personal info, skills, experience, education, strengths, recommendations
- Processing time: 5-15 seconds

**Example (JavaScript/Fetch):**

```javascript
const resumeId = "507f1f77bcf86cd799439011"; // From upload

const response = await fetch("http://localhost:3000/api/analyze-cv", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ resumeId }),
});

const analysis = await response.json();
console.log("Skills:", analysis.data.analysis.skills);
console.log("Recommendations:", analysis.data.analysis.recommendations);
```

---

#### 3. Summarize PDF

Generate summary sederhana dari extracted text PDF.

**Endpoint:** `POST /api/summarize-pdf`

**Request Headers:**

```http
Content-Type: application/json
```

**Request Body:**

```json
{
  "resumeId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200 OK):**

```json
{
  "message": "PDF summarized successfully",
  "summary": {
    "wordCount": 543,
    "lineCount": 89,
    "characterCount": 2543,
    "preview": "John Doe\nSoftware Engineer\nExperience: 5+ years\nSkills: React, Node.js, Python...",
    "keyPoints": [
      "5+ years of software engineering experience",
      "Full-stack developer with React and Node.js",
      "Team leadership and project management",
      "Bachelor's degree in Computer Science",
      "Multiple successful project deliveries"
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request` - resumeId missing
- `404 Not Found` - Resume not found
- `500 Internal Server Error` - Summary generation failed

**Important Notes:**

- Simpler alternative to analyze-cv (no AI)
- Faster processing (instant)
- Basic text statistics and preview
- Endpoint ini **tidak perlu authentication**

---

### 🎯 Job Matching APIs

#### 1. Create Job Matching Preferences

Buat preferensi untuk mendapatkan rekomendasi pekerjaan.

**Endpoint:** `POST /api/match-making`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "jobTitle": "Software Engineer",
  "location": "Jakarta",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-level",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "salaryRange": {
    "min": 10000000,
    "max": 20000000
  },
  "remotePreference": "Hybrid",
  "industries": ["Technology", "Fintech"]
}
```

**Success Response (201 Created):**

```json
{
  "createdPreferences": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "employmentType": "Full-time",
    "experienceLevel": "Mid-level",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "salaryRange": {
      "min": 10000000,
      "max": 20000000
    },
    "remotePreference": "Hybrid",
    "industries": ["Technology", "Fintech"],
    "createdAt": "2025-11-17T10:30:00.000Z",
    "updatedAt": "2025-11-17T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Token missing, invalid, atau expired
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Server error

**Field Descriptions:**

- `jobTitle`: Target job position
- `location`: Preferred work location
- `employmentType`: Full-time, Part-time, Contract, Internship
- `experienceLevel`: Entry, Mid-level, Senior, Lead
- `skills`: Array of technical/soft skills
- `salaryRange`: Min and max expected salary (IDR)
- `remotePreference`: Remote, Hybrid, On-site (optional)
- `industries`: Preferred industries (optional)

---

#### 2. Get Job Matches by Preference ID

Dapatkan job recommendations berdasarkan preferences dengan AI ranking.

**Endpoint:** `GET /api/match-making/{preferencesId}`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**URL Parameters:**

- `preferencesId` - MongoDB ObjectId dari preferences

**Success Response (200 OK):**

```json
{
  "message": "Job matches retrieved successfully",
  "preferences": {
    "_id": "507f1f77bcf86cd799439012",
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "matches": [
    {
      "jobId": "linkedin_job_123",
      "company": "Tech Startup Indonesia",
      "title": "Senior Software Engineer",
      "location": "Jakarta, Indonesia",
      "salary": "Rp 15,000,000 - Rp 20,000,000 per month",
      "employmentType": "Full-time",
      "matchScore": 92,
      "description": "We are looking for an experienced software engineer to join our growing team. You will work on building scalable microservices and modern web applications.",
      "requirements": [
        "3+ years of experience in software development",
        "Strong knowledge of React.js and Node.js",
        "Experience with MongoDB or similar NoSQL databases",
        "Familiarity with cloud platforms (AWS, GCP)"
      ],
      "benefits": [
        "Competitive salary",
        "Health insurance",
        "Flexible working hours",
        "Remote work options"
      ],
      "postedDate": "2025-11-15",
      "applicationUrl": "https://linkedin.com/jobs/view/123",
      "aiReason": "This position is a strong match because it aligns perfectly with your React and Node.js skills. The salary range matches your expectations, and the company offers hybrid work arrangement which fits your preference. Your experience level is ideal for this senior role."
    },
    {
      "jobId": "linkedin_job_124",
      "company": "Digital Solutions Corp",
      "title": "Full Stack Developer",
      "location": "Jakarta, Indonesia",
      "salary": "Rp 12,000,000 - Rp 18,000,000 per month",
      "employmentType": "Full-time",
      "matchScore": 88,
      "description": "Join our team to build innovative web applications using modern JavaScript frameworks.",
      "requirements": [
        "2+ years of full-stack development",
        "JavaScript, React, Node.js",
        "RESTful API design",
        "Git version control"
      ],
      "benefits": [
        "Health insurance",
        "Professional development budget",
        "Team building activities"
      ],
      "postedDate": "2025-11-14",
      "applicationUrl": "https://linkedin.com/jobs/view/124",
      "aiReason": "Good fit based on your technical stack. The role emphasizes React and Node.js which are your core strengths. Salary is within your target range, though slightly lower than the senior position."
    }
  ],
  "totalMatches": 2,
  "aiInsights": {
    "summary": "Found 2 highly relevant positions matching your preferences",
    "topSkillsRequired": ["React", "Node.js", "JavaScript", "MongoDB"],
    "averageSalary": "Rp 15,500,000",
    "recommendations": [
      "Your skillset is highly sought after in the Jakarta market",
      "Consider applying to both positions as they offer different growth paths",
      "The senior role offers better compensation and aligns with your experience"
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request` - preferencesId missing or invalid format
- `401 Unauthorized` - Token missing, invalid, atau expired
- `404 Not Found` - Preferences not found or not owned by user
- `500 Internal Server Error` - API error or AI processing failed

**Processing Flow:**

1. Validate token & preferencesId
2. Fetch preferences from database
3. Search jobs from LinkedIn Jobs API
4. Use Gemini AI untuk:
   - Ranking jobs berdasarkan match score
   - Generate AI reasoning untuk setiap match
   - Provide insights dan recommendations
5. Return top matches (max 20)

**Important Notes:**

- Uses LinkedIn Jobs API for real job listings
- AI matching considers: skills, location, salary, experience level
- Processing time: 10-30 seconds
- Results cached untuk performa
- Match score: 0-100 (higher is better)

---

### 💰 Salary Benchmark APIs

#### 1. Create Salary Benchmark Request

Submit request untuk analisis salary benchmarking.

**Endpoint:** `POST /api/sallary-benchmark`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "jobTitle": "Full Stack Developer",
  "location": "Jakarta",
  "experienceYear": 3,
  "skills": ["React", "Node.js", "MongoDB", "Docker"],
  "education": "Bachelor",
  "currentOrOfferedSallary": 15000000,
  "companySize": "Startup",
  "industry": "Technology"
}
```

**Success Response (201 Created):**

```json
{
  "message": "Request saved",
  "request": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "jobTitle": "Full Stack Developer",
    "location": "Jakarta",
    "experienceYear": 3,
    "skills": ["React", "Node.js", "MongoDB", "Docker"],
    "education": "Bachelor",
    "currentOrOfferedSallary": 15000000,
    "companySize": "Startup",
    "industry": "Technology",
    "createdAt": "2025-11-17T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Token missing, invalid, atau expired
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Server error

**Field Descriptions:**

- `jobTitle`: Position title
- `location`: Work location (city)
- `experienceYear`: Years of experience (number)
- `skills`: Array of relevant skills
- `education`: High School, Diploma, Bachelor, Master, PhD
- `currentOrOfferedSallary`: Current or offered salary in IDR
- `companySize`: Startup, SME, Corporate (optional)
- `industry`: Industry sector (optional)

---

#### 2. Get Salary Benchmark Analysis

Dapatkan analisis comprehensive salary benchmark dengan AI dan data historical.

**Endpoint:** `GET /api/sallary-benchmark/{id}`

**Request Headers:**

```http
Authorization: Bearer {jwt_token}
```

**URL Parameters:**

- `id` - MongoDB ObjectId dari salary request

**Success Response (200 OK):**

```json
{
  "message": "Salary benchmark retrieved successfully",
  "request": {
    "jobTitle": "Full Stack Developer",
    "location": "Jakarta",
    "experienceYear": 3,
    "skills": ["React", "Node.js", "MongoDB", "Docker"],
    "currentOrOfferedSallary": 15000000
  },
  "benchmark": {
    "market": {
      "min": 8000000,
      "average": 16500000,
      "max": 28000000,
      "median": 15000000,
      "percentile25": 12000000,
      "percentile50": 15000000,
      "percentile75": 20000000,
      "percentile90": 24000000
    },
    "yourPosition": {
      "percentile": 50,
      "status": "At Market Average",
      "difference": -1500000,
      "differencePercent": -9.1,
      "comparedToMarket": "Your salary is slightly below the market average"
    },
    "similarProfiles": 15,
    "similarProfilesData": [
      {
        "jobTitle": "Full Stack Developer",
        "location": "Jakarta",
        "experienceYear": 3,
        "salary": 16000000,
        "skills": ["React", "Node.js", "PostgreSQL"]
      },
      {
        "jobTitle": "Software Engineer",
        "location": "Jakarta",
        "experienceYear": 4,
        "salary": 18000000,
        "skills": ["React", "Node.js", "AWS"]
      }
    ],
    "insights": {
      "comparison": "Your salary of Rp 15,000,000 is at the 50th percentile, meaning you earn the same as the median developer with similar experience. There's room for negotiation especially if you have specialized skills.",
      "marketTrend": "The Jakarta market for Full Stack Developers shows strong demand with competitive salaries, especially for React and Node.js specialists.",
      "recommendations": [
        "Consider negotiating for Rp 16-18M range based on market data",
        "Your React and Node.js skills are highly valuable - emphasize these",
        "Docker experience is a plus that justifies higher compensation",
        "With 3 years experience, you're eligible for mid-senior positions",
        "Startups in Jakarta typically offer equity alongside base salary"
      ],
      "factors": [
        "Your experience level (3 years) is competitive for the role",
        "Tech stack (React, Node.js, MongoDB) is modern and in-demand",
        "Jakarta market offers abundant opportunities",
        "Education level meets standard requirements",
        "Docker skills provide additional leverage"
      ],
      "negotiationTips": [
        "Research company-specific salary bands",
        "Highlight your unique project experiences",
        "Consider total compensation (base + benefits + equity)",
        "Be prepared to discuss performance metrics",
        "Timing matters - negotiate during offer or review cycles"
      ]
    },
    "aiAnalysis": "Based on analysis of 15 similar profiles in our database and current Jakarta market conditions, your salary is competitive but has room for growth. The market average for Full Stack Developers with 3 years of experience is Rp 16.5M. Your skillset in React, Node.js, and Docker positions you well for senior roles. Companies are actively seeking developers with your profile, giving you strong negotiating power. Consider targeting positions offering Rp 17-20M as you have the experience and skills to justify this range.",
    "salaryBreakdown": {
      "byExperience": {
        "0-2 years": 10000000,
        "3-5 years": 16500000,
        "6-10 years": 25000000,
        "10+ years": 35000000
      },
      "byLocation": {
        "Jakarta": 16500000,
        "Bandung": 13000000,
        "Surabaya": 14000000,
        "Bali": 12000000
      },
      "byCompanySize": {
        "Startup": 15000000,
        "SME": 16000000,
        "Corporate": 20000000,
        "MNC": 25000000
      }
    }
  }
}
```

**Error Responses:**

- `400 Bad Request` - ID missing or invalid
- `401 Unauthorized` - Token missing, invalid, atau expired
- `404 Not Found` - Request not found
- `500 Internal Server Error` - Analysis failed

**Processing Flow:**

1. Validate token & requestId
2. Fetch request from database
3. **Generate embedding** untuk query menggunakan Gemini AI
4. **Vector search** di MongoDB untuk similar profiles (menggunakan embeddings)
5. Calculate statistics dari similar profiles
6. **Generate AI insights** menggunakan Gemini AI
7. Return comprehensive analysis dengan recommendations

**Important Notes:**

- Uses vector search untuk find similar profiles
- AI analysis considers multiple factors: skills, experience, location, education
- Processing time: 15-30 seconds
- Requires minimum 5 similar profiles for accurate benchmarking
- Data anonymized untuk privacy

---

### 🛠️ Helper APIs

#### 1. List Gemini Models

Dapatkan daftar model Gemini AI yang tersedia.

**Endpoint:** `GET /api/list-models`

**Request Headers:**

```http
None required
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "totalModels": 8,
  "models": [
    {
      "name": "models/gemini-1.5-flash",
      "displayName": "Gemini 1.5 Flash",
      "description": "Fast and versatile performance across a diverse variety of tasks"
    },
    {
      "name": "models/gemini-1.5-pro",
      "displayName": "Gemini 1.5 Pro",
      "description": "Mid-size multimodal model that supports up to 2 million tokens"
    },
    {
      "name": "models/gemini-1.0-pro",
      "displayName": "Gemini 1.0 Pro",
      "description": "The best model for scaling across a wide range of tasks"
    },
    {
      "name": "models/text-embedding-004",
      "displayName": "Text Embedding 004",
      "description": "Latest text embedding model for semantic search"
    }
  ]
}
```

**Error Responses:**

- `500 Internal Server Error` - API key not found or Gemini error

**Use Case:**

- Check available models
- Verify API configuration
- Development & debugging

---

#### 2. Test Gemini Connection

Test koneksi dan konfigurasi Gemini AI.

**Endpoint:** `GET /api/test-gemini`

**Request Headers:**

```http
None required
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Gemini API is working!",
  "response": "{\"message\": \"Hello, Gemini is working!\"}",
  "apiKeyLength": 39,
  "model": "gemini-1.5-flash",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

**Error Responses:**

- `500 Internal Server Error` - API key not found, invalid, or Gemini error

**Response Details:**

- `success`: Boolean indicating API status
- `message`: Status message
- `response`: Sample response from Gemini
- `apiKeyLength`: Length of API key (for validation)
- `model`: Model used for test
- `timestamp`: Test execution time

**Use Case:**

- Verify Gemini API configuration
- Check API key validity
- Troubleshoot connection issues
- Health check endpoint

---

## ⚠️ Error Handling

### Standard Error Response Format

Semua error responses mengikuti format standar:

```json
{
  "message": "Error message description",
  "error": "Detailed error information (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### HTTP Status Codes

| Code | Status                | Description                                     |
| ---- | --------------------- | ----------------------------------------------- |
| 200  | OK                    | Request successful                              |
| 201  | Created               | Resource created successfully                   |
| 400  | Bad Request           | Invalid request data or validation error        |
| 401  | Unauthorized          | Authentication required or token invalid        |
| 403  | Forbidden             | Access denied                                   |
| 404  | Not Found             | Resource not found                              |
| 409  | Conflict              | Resource already exists (e.g., duplicate email) |
| 500  | Internal Server Error | Server error                                    |
| 503  | Service Unavailable   | External service temporarily unavailable        |

### Common Error Examples

**401 Unauthorized:**

```json
{
  "message": "Unauthorized. Please provide valid token."
}
```

**400 Bad Request:**

```json
{
  "message": "Validation failed",
  "error": "Email is required"
}
```

**404 Not Found:**

```json
{
  "message": "Resource not found",
  "error": "User with ID 507f1f77bcf86cd799439011 not found"
}
```

**500 Internal Server Error:**

```json
{
  "message": "Failed to process request",
  "error": "Database connection failed"
}
```

### Error Handling Best Practices

1. **Always check response status:**

```javascript
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message);
}
```

2. **Handle 401 Unauthorized:**

```javascript
if (response.status === 401) {
  localStorage.removeItem("karirkit_access_token");
  window.location.href = "/login";
}
```

3. **Display user-friendly messages:**

```javascript
try {
  const data = await apiCall();
} catch (error) {
  alert(`Error: ${error.message || "Something went wrong"}`);
}
```

---

## 🚦 Rate Limits

### Current Limits

- **General APIs:** 100 requests per minute per IP
- **AI APIs (analyze-cv, match-making, salary-benchmark):** 10 requests per minute per user
- **Upload APIs:** 20 requests per hour per user

### Rate Limit Headers

Response headers include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700200000
```

### Rate Limit Exceeded Response

```json
{
  "message": "Rate limit exceeded",
  "error": "Too many requests. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

**Status Code:** `429 Too Many Requests`

### Best Practices

1. Implement exponential backoff
2. Cache responses when possible
3. Use batch operations where available
4. Monitor rate limit headers
5. Handle 429 responses gracefully

---

## 🔧 Environment Setup

### Required Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/karirkit?retryWrites=true&w=majority

# Gemini AI
Gemini_API_Key=AIzaSy... (39 characters)

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Vision (for OCR)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# n8n Webhook (for PDF extraction)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/extract-pdf

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# NextAuth (if using)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# App Config
NODE_ENV=development
PORT=3000
```

### Setup Instructions

1. **Clone repository:**

```bash
git clone https://github.com/Final-Project-HCK-88/KarirKit.git
cd KarirKit/my-app
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create .env.local file:**

```bash
cp .env.example .env.local
# Edit .env.local dengan values yang benar
```

4. **Run development server:**

```bash
npm run dev
```

5. **Test API:**

```bash
curl http://localhost:3000/api/test-gemini
```

---

## 📞 Support & Resources

### Documentation

- [Gemini AI Docs](https://ai.google.dev/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

### Contact

- **Email:** support@karirkit.com
- **GitHub Issues:** [Create Issue](https://github.com/Final-Project-HCK-88/KarirKit/issues)
- **Discord:** [Join Server](https://discord.gg/karirkit)

### Changelog

- **v2.0.0** (2025-11-17) - Unified Bearer Token authentication
- **v1.0.0** (2025-11-01) - Initial API release

---

**Made with ❤️ by KarirKit Team**  
**© 2025 KarirKit. All rights reserved.**
