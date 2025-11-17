# KarirKit API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Semua protected endpoints memerlukan Bearer Token di header:

```
Authorization: Bearer <your_jwt_token>
```

Token didapat dari endpoint **Login** atau **Register**.

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [User Profile](#user-profile-endpoints)
3. [Job Matching](#job-matching-endpoints)
4. [Salary Benchmark](#salary-benchmark-endpoints)
5. [Resume/CV Management](#resumecv-management-endpoints)
6. [Error Responses](#error-responses)

---

## Authentication Endpoints

### 1. Register User

**POST** `/api/register`

**Access:** Public

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": "691abf11848fdfa4f6ad7013",
    "fullname": "John Doe",
    "email": "john@example.com",
    "image": null,
    "_id": "691abf11848fdfa4f6ad7013"
  }
}
```

**Notes:**

- Password akan di-hash otomatis
- Email harus unique
- Setelah register, lakukan login untuk mendapat token

---

### 2. Login User

**POST** `/api/login`

**Access:** Public

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "User logged in successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**

- Simpan `access_token` di localStorage/sessionStorage
- Gunakan token ini untuk semua protected endpoints
- Token tidak expire (stateless JWT)

**Frontend Implementation:**

```javascript
// Login
const response = await fetch("http://localhost:3000/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
localStorage.setItem("token", data.access_token);
```

---

### 3. Logout User

**POST** `/api/logout`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Logout successful. Please remove token from client storage."
}
```

**Notes:**

- Endpoint ini hanya memberi konfirmasi
- Hapus token dari localStorage di frontend

**Frontend Implementation:**

```javascript
await fetch("http://localhost:3000/api/logout", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

localStorage.removeItem("token");
```

---

## User Profile Endpoints

### 4. Get Profile

**GET** `/api/profile`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "image": "https://cloudinary.com/path/to/image.jpg",
  "phone": "+628123456789"
}
```

**Frontend Implementation:**

```javascript
const response = await fetch("http://localhost:3000/api/profile", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const profile = await response.json();
```

---

### 5. Update Profile

**PUT** `/api/profile`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```javascript
const formData = new FormData();
formData.append("fullname", "John Doe Updated");
formData.append("phone", "+628123456789");
formData.append("image", fileInput.files[0]); // Optional
```

**Response (200):**

```json
{
  "message": "Profile updated successfully",
  "data": {
    "fullname": "John Doe Updated",
    "email": "john@example.com",
    "image": "https://cloudinary.com/path/to/new-image.jpg",
    "phone": "+628123456789"
  }
}
```

**Frontend Implementation:**

```javascript
const formData = new FormData();
formData.append("fullname", fullname);
formData.append("phone", phone);
if (imageFile) {
  formData.append("image", imageFile);
}

const response = await fetch("http://localhost:3000/api/profile", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    // Don't set Content-Type, browser will set it automatically for FormData
  },
  body: formData,
});
```

---

## Job Matching Endpoints

### 6. Create Job Matching Request

**POST** `/api/match-making`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "location": "Jakarta",
  "industry": "Technology",
  "expectedSalary": 15000000,
  "skill": ["JavaScript", "React", "Node.js"],
  "position": "Software Engineer"
}
```

**Field Details:**

- `location` (string, required, min 3 chars) - City/location for job search
- `industry` (string, required, min 3 chars) - Industry/sector (e.g., "Technology", "Finance", "Healthcare")
- `expectedSalary` (number, required, min 0) - Expected salary in IDR
- `skill` (array of strings, optional) - List of skills
- `position` (string, required, min 3 chars) - Desired job position/title

**Response (201):**

```json
{
  "createdPreferences": {
    "id": "691abf12848fdfa4f6ad7014",
    "userId": "691abf11848fdfa4f6ad7013",
    "location": "Jakarta",
    "industry": "Technology",
    "expectedSalary": 15000000,
    "skill": ["JavaScript", "React", "Node.js"],
    "position": "Software Engineer"
  }
}
```

**Notes:**

- Sistem akan menyimpan preferences user
- Gunakan ID dari response untuk get job listings
- `expectedSalary` dalam format IDR (number, bukan string)
- `skill` adalah array, bukan `skills`

**Frontend Implementation:**

```javascript
const response = await fetch("http://localhost:3000/api/match-making", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    location,
    industry,
    expectedSalary: parseInt(expectedSalary),
    skill: skillsArray, // array of strings
    position,
  }),
});

const { createdPreferences } = await response.json();
const matchingId = createdPreferences.id;
```

---

### 7. Get Job Matching Results

**GET** `/api/match-making/{id}`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (string) - ID dari preferences yang dibuat di step sebelumnya

**Response (200):**

```json
{
  "message": "Real-time job matching completed successfully",
  "source": "LinkedIn + Gemini AI",
  "preferences": {
    "_id": "691abf12848fdfa4f6ad7014",
    "userId": "691abf11848fdfa4f6ad7013",
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "skills": ["JavaScript", "React"]
  },
  "jobListings": [
    {
      "id": "linkedin-1",
      "position": "Senior Software Engineer",
      "company": "Tech Company",
      "location": "Jakarta, Indonesia",
      "salary": "$50k-$80k",
      "posted": "2 days ago",
      "url": "https://linkedin.com/jobs/...",
      "matchScore": 85,
      "matchReason": "Strong match based on skills and experience"
    }
  ],
  "summary": {
    "totalJobs": 10,
    "averageMatchScore": 75,
    "topMatchingSkills": ["JavaScript", "React"]
  }
}
```

**Notes:**

- Job listings dari LinkedIn API real-time
- Match score dihitung oleh Gemini AI
- Proses bisa memakan waktu 5-10 detik

**Frontend Implementation:**

```javascript
const response = await fetch(
  `http://localhost:3000/api/match-making/${matchingId}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

const { jobListings, summary } = await response.json();
```

---

## Salary Benchmark Endpoints

### 8. Create Salary Benchmark Request

**POST** `/api/sallary-benchmark`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "jobTitle": "Software Engineer",
  "location": "Jakarta",
  "experienceYear": 3,
  "currentOrOfferedSallary": 15000000
}
```

**Field Details:**

- `jobTitle` (string, required) - Job position
- `location` (string, required) - City/Location
- `experienceYear` (number, required) - Years of experience (0+)
- `currentOrOfferedSallary` (number, required) - Salary in IDR

**Response (201):**

```json
{
  "message": "Request saved",
  "request": {
    "id": "691abf29848fdfa4f6ad7015",
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "experienceYear": 3,
    "currentOrOfferedSallary": 15000000,
    "userId": "691abf11848fdfa4f6ad7013"
  }
}
```

**Frontend Implementation:**

```javascript
const response = await fetch("http://localhost:3000/api/sallary-benchmark", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jobTitle,
    location,
    experienceYear: parseInt(experience),
    currentOrOfferedSallary: parseInt(salary),
  }),
});

const { request } = await response.json();
const benchmarkId = request.id;
```

---

### 9. Get Salary Benchmark Analysis

**GET** `/api/sallary-benchmark/{id}`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id` (string) - ID dari salary request

**Response (200):**

```json
{
  "message": "Benchmark generated successfully",
  "data": {
    "marketMinimum": 12000000,
    "marketMedian": 17000000,
    "marketMaximum": 25000000,
    "userSalary": 15000000,
    "negotiationTips": [
      "Highlight specific technical skills",
      "Emphasize experience with in-demand frameworks",
      "Research company salary ranges before negotiation"
    ],
    "marketAnalysis": "Your salary is within market range...",
    "recommendation": "Consider negotiating towards the median..."
  }
}
```

**Notes:**

- Data salary dari vector search di database
- AI-powered analysis menggunakan Gemini
- Tips negotiation personalized berdasarkan data user

**Frontend Implementation:**

```javascript
const response = await fetch(
  `http://localhost:3000/api/sallary-benchmark/${benchmarkId}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

const { data } = await response.json();
// Display chart with marketMinimum, marketMedian, marketMaximum, userSalary
```

---

## Resume/CV Management Endpoints

### 10. Upload PDF Resume

**POST** `/api/upload-pdf`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```javascript
const formData = new FormData();
formData.append("file", pdfFile); // File object from input
```

**Response (200):**

```json
{
  "message": "File uploaded and processed successfully",
  "data": {
    "resumeId": "691abf3a848fdfa4f6ad7016",
    "fileUrl": "https://res.cloudinary.com/path/to/file.png",
    "fileName": "resume.pdf",
    "fileSize": 245678,
    "textExtracted": true,
    "textLength": 1543,
    "textPreview": "John Doe\nSoftware Engineer..."
  }
}
```

**Notes:**

- Max file size: 10MB
- Accepted formats: PDF, images (jpg, png)
- PDF akan di-convert ke PNG di Cloudinary
- Text extraction otomatis via n8n webhook
- Simpan `resumeId` untuk analyze/summarize

**Frontend Implementation:**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("http://localhost:3000/api/upload-pdf", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: formData,
});

const { data } = await response.json();
const resumeId = data.resumeId;
```

---

### 11. Analyze CV with AI

**POST** `/api/analyze-cv`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "resumeId": "691abf3a848fdfa4f6ad7016"
}
```

**Response (200):**

```json
{
  "message": "CV analyzed successfully with Gemini AI",
  "data": {
    "rawText": "John Doe\nSoftware Engineer...",
    "textLength": 1543,
    "analysis": {
      "summary": "Experienced software engineer with 5 years...",
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+628123456789",
        "location": "Jakarta, Indonesia"
      },
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "experience": [
        {
          "company": "Tech Corp",
          "position": "Senior Software Engineer",
          "duration": "2020 - Present",
          "description": "Led development of microservices..."
        }
      ],
      "education": [
        {
          "institution": "University of Indonesia",
          "degree": "Bachelor",
          "field": "Computer Science",
          "year": "2015-2019"
        }
      ],
      "strengths": [
        "Strong technical skills in modern frameworks",
        "Good team leadership experience"
      ],
      "recommendations": [
        "Add more quantifiable achievements",
        "Highlight specific project impacts"
      ]
    },
    "source": "gemini-ai"
  }
}
```

**Notes:**

- Memerlukan `resumeId` dari upload endpoint
- Analysis menggunakan Gemini 1.5 Flash
- Jika Gemini gagal, akan return mock data
- Proses bisa memakan waktu 5-15 detik

**Frontend Implementation:**

```javascript
const response = await fetch("http://localhost:3000/api/analyze-cv", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ resumeId }),
});

const { data } = await response.json();
const analysis = data.analysis;
```

---

### 12. Summarize PDF

**POST** `/api/summarize-pdf`

**Access:** Protected

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "resumeId": "691abf3a848fdfa4f6ad7016"
}
```

**Response (200):**

```json
{
  "message": "PDF text retrieved successfully",
  "data": {
    "summary": "📄 **Document Overview**\n\n📊 **Statistics:**\n- Total Words: 543\n- Total Lines: 45\n...",
    "fullText": "Complete extracted text from PDF...",
    "wordCount": 543,
    "lineCount": 45
  }
}
```

**Notes:**

- Memberikan statistik dokumen
- Summary berisi preview 10 baris pertama
- Tidak menggunakan AI, hanya text extraction

**Frontend Implementation:**

```javascript
const response = await fetch("http://localhost:3000/api/summarize-pdf", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ resumeId }),
});

const { data } = await response.json();
```

---

## Error Responses

### Common Error Formats

#### 401 Unauthorized

```json
{
  "message": "Unauthorized. Authentication token required."
}
```

**Causes:**

- Token tidak dikirim di header
- Token invalid/expired
- Token format salah (bukan "Bearer <token>")

**Frontend Handling:**

```javascript
if (response.status === 401) {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

---

#### 400 Bad Request

```json
{
  "message": "Invalid input: expected string, received undefined"
}
```

**Causes:**

- Required field tidak diisi
- Type data salah (string vs number)
- Validation error

---

#### 404 Not Found

```json
{
  "message": "Resume not found"
}
```

**Causes:**

- Resource ID tidak ditemukan
- User tidak punya akses ke resource

---

#### 500 Internal Server Error

```json
{
  "message": "Database connection failed"
}
```

**Causes:**

- Server error
- Database down
- Third-party API error (Gemini, LinkedIn, etc)

---

## Complete Frontend Example

### React/Next.js Implementation

```javascript
// lib/api.js
const API_BASE_URL = "http://localhost:3000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// Usage in components
export const login = async (email, password) => {
  const data = await apiRequest("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", data.access_token);
  return data;
};

export const getProfile = async () => {
  return await apiRequest("/api/profile");
};

export const createJobMatching = async (jobTitle, location, skills) => {
  return await apiRequest("/api/match-making", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle, location, skills }),
  });
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiRequest("/api/upload-pdf", {
    method: "POST",
    body: formData,
  });
};
```

---

## Rate Limiting & Performance

- **No rate limiting** currently implemented
- **AI operations** (Gemini) bisa lambat (5-15 detik)
- **LinkedIn API** bisa timeout jika terlalu banyak request
- Recommended: Tambahkan loading state di UI untuk operasi AI

---

## Environment Variables

Backend memerlukan:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_URL=cloudinary://...
GEMINI_API_KEY=your-gemini-key
N8N_WEBHOOK_URL=https://...
```

---

## Support & Issues

Jika ada error atau pertanyaan, hubungi backend team atau check API logs di development console.

**Last Updated:** November 17, 2025
