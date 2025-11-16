# Salary Benchmark API Documentation

## Overview

API untuk mendapatkan salary benchmark berdasarkan data pasar Indonesia menggunakan RAG (Retrieval-Augmented Generation) dengan MongoDB Atlas Vector Search dan Gemini AI.

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

Semua endpoint memerlukan JWT token yang didapat dari login.

**Header:**

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Create Salary Request

**Endpoint:** `POST /sallary-benchmark`

**Description:** Menyimpan salary request dari user untuk di-analyze.

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

**Field Validation:**

- `jobTitle` (string, required): Minimal 1 karakter
- `location` (string, required): Minimal 1 karakter
- `experienceYear` (number, required): Minimal 0
- `currentOrOfferedSallary` (number, required): Minimal 0 (dalam IDR per bulan)

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

**Frontend Usage Example:**

```typescript
const createSalaryRequest = async (data: {
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
}) => {
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
  return result.request._id; // Save this ID for next step
};
```

---

### 2. Get Salary Benchmark (RAG)

**Endpoint:** `GET /sallary-benchmark/:id`

**Description:** Generate salary benchmark analysis menggunakan RAG dengan data dari MongoDB Vector Store dan Gemini AI.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**

- `id` (string, required): Request ID yang didapat dari POST endpoint

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
    "analysis": "Your current/offered salary of Rp 15,000,000 for a Software Engineer with 3 years of experience in Jakarta is competitive. It falls within the 'IT & Software Mid' level range of Rp 12,000,000 - Rp 25,000,000.",
    "sources": [
      "blob (page/chunk 45)",
      "blob (page/chunk 1345)",
      "blob (page/chunk 24)"
    ]
  }
}
```

**Response Fields:**

- `marketMinimum` (number): Gaji minimum di pasar untuk role/experience tsb (IDR per bulan)
- `marketMedian` (number): Gaji median di pasar (IDR per bulan)
- `marketMaximum` (number): Gaji maximum di pasar (IDR per bulan)
- `userSalary` (number): Gaji user yang di-input (IDR per bulan)
- `negotiationTips` (array of strings): 3-5 tips praktis untuk negosiasi gaji
- `analysis` (string): Analisa posisi salary user relatif terhadap market
- `sources` (array of strings): Referensi chunks dari knowledge base yang digunakan

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

_503 Service Unavailable (Gemini overloaded):_

```json
{
  "message": "{\"error\":{\"code\":503,\"message\":\"The model is overloaded. Please try again later.\"}}"
}
```

**Frontend Usage Example:**

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

// Usage
const benchmark = await getSalaryBenchmark("691767c763dda18ef44ee91a");
console.log(
  "Market Range:",
  benchmark.marketMinimum,
  "-",
  benchmark.marketMaximum
);
console.log("Your Salary:", benchmark.userSalary);
```

---

## Complete Flow Example

```typescript
// Step 1: Create salary request
const requestId = await createSalaryRequest({
  jobTitle: "Software Engineer",
  location: "Jakarta",
  experienceYear: 3,
  currentOrOfferedSallary: 15000000,
});

// Step 2: Get benchmark analysis (may take 10-15 seconds)
const benchmark = await getSalaryBenchmark(requestId);

// Step 3: Display results in UI
displaySalaryChart({
  min: benchmark.marketMinimum,
  median: benchmark.marketMedian,
  max: benchmark.marketMaximum,
  userSalary: benchmark.userSalary,
});

displayNegotiationTips(benchmark.negotiationTips);
displayAnalysis(benchmark.analysis);
```

---

## UI/UX Recommendations

### 1. Salary Chart Visualization

```typescript
// Recommended: Use bar chart or range slider
<SalaryRangeChart
  min={marketMinimum}
  median={marketMedian}
  max={marketMaximum}
  userValue={userSalary}
/>
```

**Visual Example:**

```
Min         User         Median              Max
|------------|-------------|------------------|
10M         15M           15M                25M
     ↑ You are here
```

### 2. Negotiation Tips Display

```typescript
<NegotiationTips>
  {negotiationTips.map((tip, index) => (
    <TipCard key={index} number={index + 1}>
      {tip}
    </TipCard>
  ))}
</NegotiationTips>
```

### 3. Analysis Section

```typescript
<AnalysisCard>
  <h3>Market Analysis</h3>
  <p>{analysis}</p>
  <small>Sources: {sources.join(", ")}</small>
</AnalysisCard>
```

### 4. Loading State

GET endpoint bisa take 10-15 detik karena:

- Vector search di MongoDB
- AI generation dari Gemini

**Recommended:**

```typescript
const [loading, setLoading] = useState(false);
const [progress, setProgress] = useState(0);

// Show loading spinner with message
{
  loading && (
    <LoadingOverlay>
      <Spinner />
      <p>Analyzing market data...</p>
      <ProgressBar value={progress} />
    </LoadingOverlay>
  );
}
```

---

## Error Handling

### Common Errors & Solutions

**1. 401 Unauthorized**

```typescript
if (response.status === 401) {
  // Redirect to login
  router.push("/login");
}
```

**2. 503 Gemini Overloaded**

```typescript
if (response.status === 503) {
  // Show retry option
  showNotification("AI service is busy. Please try again in a moment.");
  // Implement retry with exponential backoff
}
```

**3. Network Timeout**

```typescript
const fetchWithTimeout = async (url: string, options: any, timeout = 30000) => {
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

## Rate Limiting & Best Practices

1. **Debounce user input** - Jangan langsung hit API saat user typing
2. **Cache results** - Simpan hasil benchmark di local storage/state
3. **Show loading states** - Endpoint bisa lambat (10-15s), kasih feedback ke user
4. **Retry logic** - Implement exponential backoff untuk 503 errors
5. **Validate input** - Client-side validation sebelum POST
6. **Format currency** - Display numbers dengan proper IDR formatting

**Example Currency Formatter:**

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

---

## TypeScript Interfaces

```typescript
// Request types
interface SalaryRequestInput {
  jobTitle: string;
  location: string;
  experienceYear: number;
  currentOrOfferedSallary: number;
}

interface SalaryRequestResponse {
  message: string;
  request: {
    _id: string;
    jobTitle: string;
    location: string;
    experienceYear: number;
    currentOrOfferedSallary: number;
    userId: string;
    createdAt: string;
  };
}

// Benchmark types
interface SalaryBenchmarkData {
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
  data: SalaryBenchmarkData;
}

// Error types
interface ApiError {
  message: string;
}
```

---

## Testing Examples

### Using Postman

**1. Test POST endpoint:**

```
POST http://localhost:3000/api/sallary-benchmark
Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
Body (raw JSON):
{
  "jobTitle": "Software Engineer",
  "location": "Jakarta",
  "experienceYear": 3,
  "currentOrOfferedSallary": 15000000
}
```

**2. Test GET endpoint:**

```
GET http://localhost:3000/api/sallary-benchmark/691767c763dda18ef44ee91a
Headers:
  Authorization: Bearer eyJhbGc...
```

### Using cURL

```bash
# POST request
curl -X POST "http://localhost:3000/api/sallary-benchmark" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Software Engineer",
    "location": "Jakarta",
    "experienceYear": 3,
    "currentOrOfferedSallary": 15000000
  }'

# GET request
curl -X GET "http://localhost:3000/api/sallary-benchmark/REQUEST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support & Contact

- **Backend Developer:** [Your Contact]
- **API Version:** 1.0.0
- **Last Updated:** November 15, 2025
