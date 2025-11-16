# KarirKit API Documentation

**Version:** 1.0.0  
**Last Updated:** November 15, 2025  
**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
   - [Register](#1-register)
   - [Login](#2-login)
3. [Job Matching](#job-matching)
   - [Create User Preferences](#3-create-user-preferences)
   - [Get Job Matches (AI-Powered)](#4-get-job-matches)
4. [Salary Benchmark (RAG)](#salary-benchmark)
   - [Create Salary Request](#5-create-salary-request)
   - [Get Salary Benchmark Analysis](#6-get-salary-benchmark-analysis)
5. [Error Handling](#error-handling)
6. [TypeScript Interfaces](#typescript-interfaces)

---

## Authentication

Most endpoints require JWT authentication. After login, include the token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

The token is also set as a cookie automatically upon login.

---

## User Management

### 1. Register

**Endpoint:** `POST /register`

**Description:** Register a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Field Requirements:**

- `fullname` (string, required): User's full name
- `email` (string, required): Valid email address, must be unique
- `password` (string, required): Minimum length as per validation

**Success Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "data": {
    "_id": "691477096...",
    "fullname": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

_400 Bad Request - Email already exists:_

```json
{
  "message": "Email or username already in use"
}
```

_400 Bad Request - Validation error:_

```json
{
  "message": "Validation error message"
}
```

**Frontend Example:**

```typescript
const register = async (data: {
  fullname: string;
  email: string;
  password: string;
}) => {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
};
```

---

### 2. Login

**Endpoint:** `POST /login`

**Description:** Login user and receive JWT token.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Field Requirements:**

- `email` (string, required): Registered email
- `password` (string, required): User's password

**Success Response (200 OK):**

```json
{
  "message": "User logged in successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Token is also automatically set as a cookie named "Authorization" with value "Bearer {token}"

**Error Responses:**

_401 Unauthorized - Invalid credentials:_

```json
{
  "message": "Invalid email or password"
}
```

**Frontend Example:**

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const result = await response.json();

  // Save token to localStorage
  localStorage.setItem("token", result.access_token);

  return result;
};
```

---

## Job Matching

### 3. Create User Preferences

**Endpoint:** `POST /match-making`

**Description:** Save user's job preferences for matching.

**Authentication:** Required (JWT)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "location": "Jakarta",
  "industry": "Technology",
  "expectedSalary": 15000000,
  "skill": "JavaScript, React, Node.js",
  "position": "Full Stack Developer"
}
```

**Field Requirements:**

- `location` (string, required): Preferred job location
- `industry` (string, required): Preferred industry
- `expectedSalary` (number, required): Expected salary in IDR per month
- `skill` (string, required): Skills, comma-separated
- `position` (string, required): Desired job position

**Success Response (201 Created):**

```json
{
  "createdPreferences": {
    "_id": "6917...",
    "userId": "6914...",
    "location": "Jakarta",
    "industry": "Technology",
    "expectedSalary": 15000000,
    "skill": "JavaScript, React, Node.js",
    "position": "Full Stack Developer",
    "createdAt": "2025-11-15T..."
  }
}
```

**Error Responses:**

_401 Unauthorized:_

```json
{
  "message": "Unauthorized. Please login first."
}
```

_400 Bad Request:_

```json
{
  "message": "Validation error message"
}
```

**Frontend Example:**

```typescript
interface UserPreferences {
  location: string;
  industry: string;
  expectedSalary: number;
  skill: string;
  position: string;
}

const createPreferences = async (preferences: UserPreferences) => {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/match-making", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  const result = await response.json();
  return result.createdPreferences._id; // Save for next step
};
```

---

### 4. Get Job Matches

**Endpoint:** `GET /match-making/:id`

**Description:** Get AI-powered job matches from LinkedIn based on user preferences. This endpoint fetches real-time job data from LinkedIn and uses Gemini AI to analyze and rank jobs.

**Authentication:** Required (JWT)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**

- `id` (string, required): User preferences ID from previous step

**Success Response (200 OK):**

```json
{
  "message": "Real-time job matching completed successfully",
  "source": "LinkedIn + Gemini AI",
  "preferences": {
    "_id": "6917...",
    "userId": "6914...",
    "location": "Jakarta",
    "industry": "Technology",
    "expectedSalary": 15000000,
    "skill": "JavaScript, React, Node.js",
    "position": "Full Stack Developer"
  },
  "jobListings": [
    {
      "company": "Tech Company Inc",
      "position": "Senior Full Stack Developer",
      "location": "Jakarta, Indonesia",
      "description": "We are looking for...",
      "listedAt": "2 days ago",
      "link": "https://linkedin.com/jobs/...",
      "matchScore": 95,
      "matchReason": "Strong match: Your JavaScript, React, and Node.js skills align perfectly with this role. The position matches your desired title and location.",
      "salaryInsight": "Based on market data, this role typically offers Rp 18M - 25M per month, which exceeds your expected salary."
    },
    {
      "company": "Startup ABC",
      "position": "Full Stack Engineer",
      "location": "Jakarta",
      "description": "Join our team...",
      "listedAt": "1 week ago",
      "link": "https://linkedin.com/jobs/...",
      "matchScore": 88,
      "matchReason": "Good match: Your technical skills match well. The startup environment offers growth opportunities.",
      "salaryInsight": "Expected salary range: Rp 15M - 20M per month."
    }
  ],
  "totalJobs": 10
}
```

**Response Fields:**

- `preferences` (object): User's saved preferences
- `jobListings` (array): AI-matched and ranked job listings from LinkedIn
  - `company` (string): Company name
  - `position` (string): Job title
  - `location` (string): Job location
  - `description` (string): Job description
  - `listedAt` (string): When the job was posted
  - `link` (string): LinkedIn job URL
  - `matchScore` (number): AI-calculated match score (0-100)
  - `matchReason` (string): AI explanation why this job matches
  - `salaryInsight` (string): AI-estimated salary range
- `totalJobs` (number): Total number of matched jobs
- `source` (string): Data source (LinkedIn + Gemini AI)

**Error Responses:**

_401 Unauthorized:_

```json
{
  "message": "Unauthorized. Please login first."
}
```

_404 Not Found:_

```json
{
  "message": "User preferences not found or you don't have access to it."
}
```

_500 Internal Server Error - Job matching failed:_

```json
{
  "message": "Failed to match jobs. Please try again.",
  "error": "Error details"
}
```

**Frontend Example:**

```typescript
interface JobListing {
  company: string;
  position: string;
  location: string;
  description: string;
  listedAt: string;
  link: string;
  matchScore: number;
  matchReason: string;
  salaryInsight: string;
}

const getJobMatches = async (preferencesId: string) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/match-making/${preferencesId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch job matches");
  }

  const result = await response.json();
  return result.jobListings as JobListing[];
};

// Usage with loading state
const [loading, setLoading] = useState(false);
const [jobs, setJobs] = useState<JobListing[]>([]);

const fetchJobs = async () => {
  setLoading(true);
  try {
    const jobListings = await getJobMatches(preferencesId);
    setJobs(jobListings);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};
```

**UI Recommendations for Job Matches:**

```typescript
// Sort by match score
const sortedJobs = jobs.sort((a, b) => b.matchScore - a.matchScore);

// Display job card
<JobCard>
  <MatchScore score={job.matchScore} /> {/* Show as badge/progress */}
  <CompanyName>{job.company}</CompanyName>
  <Position>{job.position}</Position>
  <Location>{job.location}</Location>
  <Description>{job.description}</Description>
  <MatchReason>{job.matchReason}</MatchReason>
  <SalaryInsight>{job.salaryInsight}</SalaryInsight>
  <ApplyButton href={job.link}>Apply on LinkedIn</ApplyButton>
</JobCard>;
```

---

## Salary Benchmark

### 5. Create Salary Request

**Endpoint:** `POST /sallary-benchmark`

**Description:** Submit salary information for benchmark analysis.

**Authentication:** Required (JWT)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
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

**Field Requirements:**

- `jobTitle` (string, required): Minimum 1 character
- `location` (string, required): Minimum 1 character
- `experienceYear` (number, required): Minimum 0
- `currentOrOfferedSallary` (number, required): Minimum 0 (IDR per month)

**Success Response (201 Created):**

```json
{
  "message": "Request saved",
  "request": {
    "_id": "691767c763dda18ef44ee91a",
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "experienceYear": 3,
    "currentOrOfferedSallary": 15000000,
    "userId": "691477096...",
    "createdAt": "2025-11-15T12:34:56.789Z"
  }
}
```

**Error Responses:**

_401 Unauthorized:_

```json
{
  "message": "Unauthorized. Please login first."
}
```

_400 Bad Request:_

```json
{
  "message": "Validation error message"
}
```

**Frontend Example:**

```typescript
interface SalaryRequest {
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
}

const createSalaryRequest = async (data: SalaryRequest) => {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/sallary-benchmark", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return result.request._id; // Save for next step
};
```

---

### 6. Get Salary Benchmark Analysis

**Endpoint:** `GET /sallary-benchmark/:id`

**Description:** Get AI-powered salary benchmark analysis using RAG (Retrieval-Augmented Generation) with MongoDB Atlas Vector Search and Gemini AI. This endpoint retrieves relevant salary data from the knowledge base and generates personalized insights.

**Authentication:** Required (JWT)

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**

- `id` (string, required): Salary request ID from previous step

**Note:** This endpoint may take 10-15 seconds due to:

- Vector search in MongoDB Atlas
- AI analysis by Gemini
- Knowledge base retrieval

**Success Response (200 OK):**

```json
{
  "message": "Benchmark generated successfully",
  "data": {
    "marketMinimum": 10000000,
    "marketMedian": 15000000,
    "marketMaximum": 25000000,
    "userSalary": 15000000,
    "negotiationTips": [
      "Highlight specific achievements and advanced skills (e.g., expertise in particular frameworks, cloud platforms, successful project deliveries) that demonstrate value beyond standard experience.",
      "Research the total compensation package including non-cash benefits such as health insurance, performance bonuses, professional development budgets.",
      "If the current offer is firm on base salary, negotiate for other perks like increased annual leave, flexible work arrangements, or a signing bonus.",
      "Benchmark against similar roles in high-growth or top-tier technology companies in Jakarta.",
      "Prepare a clear justification based on your market value, specific contributions, and the company's needs."
    ],
    "analysis": "Your current/offered salary of Rp 15,000,000 for a Software Engineer with 3 years of experience in Jakarta is competitive. It falls within the 'IT & Software Mid' level range of Rp 12,000,000 - Rp 25,000,000, which is suitable for an experienced engineer like yourself. This indicates a solid and competitive offer within the market.",
    "sources": [
      "blob (page/chunk 45)",
      "blob (page/chunk 1345)",
      "blob (page/chunk 24)"
    ]
  }
}
```

**Response Fields:**

- `marketMinimum` (number): Minimum market salary (IDR per month)
- `marketMedian` (number): Median market salary (IDR per month)
- `marketMaximum` (number): Maximum market salary (IDR per month)
- `userSalary` (number): User's current/offered salary (IDR per month)
- `negotiationTips` (array of strings): 3-5 actionable negotiation tips
- `analysis` (string): AI-generated analysis of user's salary position
- `sources` (array of strings): Knowledge base references used

**Error Responses:**

_401 Unauthorized:_

```json
{
  "message": "Unauthorized. Please login first."
}
```

_404 Not Found:_

```json
{
  "message": "Request not found"
}
```

_503 Service Unavailable - AI overloaded:_

```json
{
  "message": "{\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\"}}"
}
```

**Frontend Example:**

```typescript
interface SalaryBenchmark {
  marketMinimum: number;
  marketMedian: number;
  marketMaximum: number;
  userSalary: number;
  negotiationTips: string[];
  analysis: string;
  sources: string[];
}

const getSalaryBenchmark = async (
  requestId: string
): Promise<SalaryBenchmark> => {
  const token = localStorage.getItem("token");

  const response = await fetch(`/api/sallary-benchmark/${requestId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch benchmark");
  }

  const result = await response.json();
  return result.data;
};

// Usage with loading state (important!)
const [loading, setLoading] = useState(false);
const [benchmark, setBenchmark] = useState<SalaryBenchmark | null>(null);

const fetchBenchmark = async (requestId: string) => {
  setLoading(true); // Show loading for 10-15 seconds
  try {
    const data = await getSalaryBenchmark(requestId);
    setBenchmark(data);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};
```

**UI Recommendations for Salary Benchmark:**

```typescript
// 1. Salary Range Visualization
<SalaryRangeChart>
  <RangeBar
    min={marketMinimum}
    median={marketMedian}
    max={marketMaximum}
    userValue={userSalary}
  />
  <Labels>
    <Label>Min: {formatIDR(marketMinimum)}</Label>
    <Label>Median: {formatIDR(marketMedian)}</Label>
    <Label>Max: {formatIDR(marketMaximum)}</Label>
  </Labels>
  <UserMarker position={calculatePosition(userSalary, marketMinimum, marketMaximum)}>
    Your Salary: {formatIDR(userSalary)}
  </UserMarker>
</SalaryRangeChart>

// 2. Analysis Card
<AnalysisCard>
  <h3>Market Analysis</h3>
  <p>{analysis}</p>
  <Sources>
    <small>Based on: {sources.join(', ')}</small>
  </Sources>
</AnalysisCard>

// 3. Negotiation Tips
<TipsSection>
  <h3>Negotiation Tips</h3>
  {negotiationTips.map((tip, index) => (
    <TipCard key={index}>
      <TipNumber>{index + 1}</TipNumber>
      <TipText>{tip}</TipText>
    </TipCard>
  ))}
</TipsSection>

// 4. Loading State (Critical!)
{loading && (
  <LoadingOverlay>
    <Spinner />
    <p>Analyzing salary data...</p>
    <p className="text-sm">This may take 10-15 seconds</p>
  </LoadingOverlay>
)}

// Helper function
const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};
```

---

## Complete User Flows

### Flow 1: User Registration & Login

```typescript
// Step 1: Register
await register({
  fullname: "John Doe",
  email: "john@example.com",
  password: "password123",
});

// Step 2: Login
const { access_token } = await login("john@example.com", "password123");
localStorage.setItem("token", access_token);
```

### Flow 2: Job Matching

```typescript
// Step 1: Create preferences
const preferencesId = await createPreferences({
  location: "Jakarta",
  industry: "Technology",
  expectedSalary: 15000000,
  skill: "JavaScript, React, Node.js",
  position: "Full Stack Developer",
});

// Step 2: Get AI-matched jobs (from LinkedIn)
const jobListings = await getJobMatches(preferencesId);

// Step 3: Display jobs sorted by match score
const sortedJobs = jobListings.sort((a, b) => b.matchScore - a.matchScore);
```

### Flow 3: Salary Benchmark

```typescript
// Step 1: Create salary request
const requestId = await createSalaryRequest({
  jobTitle: "Software Engineer",
  location: "Jakarta",
  experienceYear: 3,
  currentOrOfferedSallary: 15000000,
});

// Step 2: Get benchmark (RAG analysis, takes 10-15s)
const benchmark = await getSalaryBenchmark(requestId);

// Step 3: Display results
displaySalaryChart(benchmark);
displayNegotiationTips(benchmark.negotiationTips);
```

---

## Error Handling

### Common Error Patterns

```typescript
// Centralized error handler
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";
  } else if (error.status === 503) {
    // AI service overloaded
    showNotification("Service is busy. Please try again in a moment.");
  } else if (error.status === 404) {
    showNotification("Resource not found.");
  } else {
    showNotification("An error occurred. Please try again.");
  }
};

// Usage in API calls
try {
  const result = await apiCall();
} catch (error) {
  handleApiError(error);
}
```

### Retry Logic for 503 Errors

```typescript
const fetchWithRetry = async (
  fetchFn: () => Promise<any>,
  maxRetries = 3,
  delay = 2000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      if (error.status === 503 && i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
```

### Timeout Handler

```typescript
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = 30000
) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
```

---

## TypeScript Interfaces

```typescript
// User types
interface RegisterData {
  fullname: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
}

// Job matching types
interface UserPreferences {
  location: string;
  industry: string;
  expectedSalary: number;
  skill: string;
  position: string;
}

interface JobListing {
  company: string;
  position: string;
  location: string;
  description: string;
  listedAt: string;
  link: string;
  matchScore: number;
  matchReason: string;
  salaryInsight: string;
}

interface JobMatchResponse {
  message: string;
  source: string;
  preferences: UserPreferences & { _id: string; userId: string };
  jobListings: JobListing[];
  totalJobs: number;
}

// Salary benchmark types
interface SalaryRequest {
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
}

interface SalaryBenchmark {
  marketMinimum: number;
  marketMedian: number;
  marketMaximum: number;
  userSalary: number;
  negotiationTips: string[];
  analysis: string;
  sources: string[];
}

interface SalaryBenchmarkResponse {
  message: string;
  data: SalaryBenchmark;
}

// Error types
interface ApiError {
  message: string;
  error?: string;
}
```

---

## Best Practices

### 1. Token Management

```typescript
// Store token after login
localStorage.setItem('token', access_token);

// Include in all authenticated requests
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`
}

// Clear on logout
localStorage.removeItem('token');
```

### 2. Loading States

```typescript
// Always show loading for long operations
const [loading, setLoading] = useState(false);

// Job matching: ~5-10 seconds
// Salary benchmark: ~10-15 seconds

{
  loading && <LoadingSpinner message="Analyzing data..." />;
}
```

### 3. Input Validation

```typescript
// Client-side validation before API call
const validateSalaryRequest = (data: SalaryRequest): boolean => {
  if (!data.jobTitle || data.jobTitle.length < 1) return false;
  if (!data.location || data.location.length < 1) return false;
  if (data.experienceYear < 0) return false;
  if (data.currentOrOfferedSallary < 0) return false;
  return true;
};
```

### 4. Currency Formatting

```typescript
const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Usage
formatIDR(15000000); // "Rp15.000.000"
```

### 5. Debouncing User Input

```typescript
import { debounce } from "lodash";

const debouncedSearch = debounce((value) => {
  // API call
}, 500);
```

---

## Rate Limiting & Performance

1. **Job Matching:** Can be slow (~5-10s) due to real-time LinkedIn scraping + AI analysis
2. **Salary Benchmark:** Can be slow (~10-15s) due to vector search + AI generation
3. **Caching:** Consider caching results in localStorage or state management
4. **Retry Logic:** Implement for 503 errors (AI service overloaded)
5. **Timeout:** Set reasonable timeouts (30s for long operations)

---

## Testing with Postman

### Collection Structure

```
KarirKit API
├── User Management
│   ├── Register
│   └── Login
├── Job Matching
│   ├── Create Preferences
│   └── Get Job Matches
└── Salary Benchmark
    ├── Create Salary Request
    └── Get Benchmark Analysis
```

### Environment Variables

```
base_url: http://localhost:3000/api
token: <set after login>
```

### Example cURL Commands

```bash
# Register
curl -X POST "http://localhost:3000/api/register" \
  -H "Content-Type: application/json" \
  -d '{"fullname":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST "http://localhost:3000/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create Preferences (requires token)
curl -X POST "http://localhost:3000/api/match-making" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"Jakarta","industry":"Technology","expectedSalary":15000000,"skill":"JavaScript","position":"Developer"}'

# Get Job Matches (requires token)
curl -X GET "http://localhost:3000/api/match-making/PREFERENCES_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Salary Request (requires token)
curl -X POST "http://localhost:3000/api/sallary-benchmark" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Software Engineer","location":"Jakarta","experienceYear":3,"currentOrOfferedSallary":15000000}'

# Get Benchmark (requires token)
curl -X GET "http://localhost:3000/api/sallary-benchmark/REQUEST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support & Maintenance

- **API Version:** 1.0.0
- **Last Updated:** November 15, 2025
- **Backend Framework:** Next.js 16 with TypeScript
- **Database:** MongoDB Atlas
- **AI Services:** Google Gemini AI, OpenAI Embeddings
- **Job Data Source:** LinkedIn (via linkedin-jobs-api)
- **Vector Search:** MongoDB Atlas Vector Search

---

## Notes

1. **Job Matching** uses real-time data from LinkedIn combined with Gemini AI for intelligent matching
2. **Salary Benchmark** uses RAG (Retrieval-Augmented Generation) with:
   - MongoDB Atlas Vector Search for knowledge retrieval
   - OpenAI embeddings (text-embedding-3-small)
   - Gemini AI (gemini-2.5-flash) for analysis
3. All authenticated endpoints require valid JWT token
4. Token is automatically set as cookie on login
5. Long-running operations (job matching, salary benchmark) require proper loading states
6. Implement retry logic for 503 errors (AI service overloaded)

---

**End of Documentation**
