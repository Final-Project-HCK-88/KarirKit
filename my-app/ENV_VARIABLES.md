# Environment Variables Documentation

## File yang Menggunakan Environment Variables

### 1. **Database Configuration**

- **File**: `db/config/mongodb.ts`
- **Variable**: `MONGODB_URI`
- **Description**: MongoDB connection string untuk database KarirKit

### 2. **Authentication & Security**

- **File**: `helpers/jwt.ts`
- **Variable**: `JWT_SECRET`
- **Description**: Secret key untuk JWT token signing

- **Files**:
  - `app/api/auth/[...nextauth]/route.ts`
  - `components/providers/session-provider.tsx`
- **Variables**:
  - `NEXTAUTH_SECRET` - Secret untuk NextAuth.js
  - `NEXTAUTH_URL` - Base URL aplikasi (default: http://localhost:3000)
  - `GOOGLE_CLIENT_ID` - Google OAuth Client ID
  - `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

### 3. **AI & Machine Learning**

#### Gemini AI (Primary)

- **File**: `helpers/gemini.ts`, `helpers/geminiai.ts`
- **Variables**:
  - `GEMINI_API_KEY` - API key untuk Google Gemini AI
  - `GEMINI_EMBEDDING_MODEL` - Model untuk embeddings (default: text-embedding-004)
- **Usage**: Contract analysis, document summarization, embeddings

#### OpenAI (Optional)

- **File**: `helpers/openai.ts`, `helpers/geminiai.ts`
- **Variables**:
  - `OPENAI_API_KEY` - API key untuk OpenAI
  - `OPENAI_EMBEDDING_MODEL` - Model untuk embeddings (default: text-embedding-3-small)
  - `USE_OPENAI` - Flag untuk menggunakan OpenAI (true/false)
  - `USE_OPENAI_EMBEDDINGS` - Flag untuk menggunakan OpenAI embeddings (true/false)
- **Usage**: Alternative AI provider, embeddings

### 4. **Cloud Storage**

- **File**: `db/config/cloudinary.ts`, `helpers/cloudinary.ts`, `app/api/upload-pdf/route.ts`
- **Variable**: `CLOUDINARY_URL`
- **Format**: `cloudinary://api_key:api_secret@cloud_name`
- **Description**: Cloudinary configuration untuk upload dan storage files

### 5. **PDF Processing**

- **File**: `app/api/upload-pdf/route.ts`, `helpers/n8n.ts`
- **Variable**: `N8N_WEBHOOK_URL`
- **Description**: n8n webhook URL untuk PDF text extraction

- **File**: `helpers/visionApi.ts`
- **Variable**: `GOOGLE_VISION_API_KEY`
- **Description**: Google Vision API key untuk OCR (optional, saat ini pakai n8n)

### 6. **Search & Research**

- **File**: `helpers/tavily.ts`
- **Variable**: `TAVILY_API_KEY`
- **Description**: Tavily AI search API untuk salary benchmarking dan web search

### 7. **Vector Search**

- **File**: `helpers/geminiai.ts`
- **Variable**: `ATLAS_VECTOR_INDEX_NAME`
- **Description**: MongoDB Atlas vector index name untuk similarity search

## Prioritas Environment Variables

### ✅ **Required (Harus Ada)**

1. `MONGODB_URI` - Database connection
2. `JWT_SECRET` - Authentication
3. `GEMINI_API_KEY` - Primary AI provider
4. `CLOUDINARY_URL` - File storage
5. `N8N_WEBHOOK_URL` - PDF processing

### ⚠️ **Recommended (Disarankan)**

1. `TAVILY_API_KEY` - Enhanced search capabilities
2. `NEXTAUTH_SECRET` - OAuth authentication
3. `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - Google sign-in

### 📦 **Optional (Opsional)**

1. `OPENAI_API_KEY` - Alternative AI provider
2. `GOOGLE_VISION_API_KEY` - Alternative OCR
3. `USE_OPENAI` & `USE_OPENAI_EMBEDDINGS` - Feature flags

## File Configuration Summary

| File                          | Env Variables Used                                                                                                                         | Purpose              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `db/config/mongodb.ts`        | MONGODB_URI                                                                                                                                | Database connection  |
| `db/config/cloudinary.ts`     | CLOUDINARY_URL                                                                                                                             | Cloud storage config |
| `helpers/jwt.ts`              | JWT_SECRET                                                                                                                                 | Token signing        |
| `helpers/gemini.ts`           | GEMINI_API_KEY                                                                                                                             | Contract analysis    |
| `helpers/geminiai.ts`         | GEMINI_API_KEY, GEMINI_EMBEDDING_MODEL, OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL, USE_OPENAI, USE_OPENAI_EMBEDDINGS, ATLAS_VECTOR_INDEX_NAME | AI & embeddings      |
| `helpers/openai.ts`           | OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL                                                                                                     | OpenAI integration   |
| `helpers/tavily.ts`           | TAVILY_API_KEY                                                                                                                             | Web search           |
| `helpers/visionApi.ts`        | GOOGLE_VISION_API_KEY                                                                                                                      | OCR (unused)         |
| `helpers/n8n.ts`              | N8N_WEBHOOK_URL                                                                                                                            | PDF extraction       |
| `app/api/upload-pdf/route.ts` | N8N_WEBHOOK_URL, CLOUDINARY_URL                                                                                                            | File upload pipeline |

## Migrasi dari .env Lama

### Perubahan Nama Variable:

1. ~~`Gemini_API_Key`~~ → `GEMINI_API_KEY` ✅
2. ~~`cloudinary_url`~~ → `CLOUDINARY_URL` ✅

### Variable Baru yang Ditambahkan:

1. `ATLAS_VECTOR_INDEX_NAME` - Vector search index
2. `USE_OPENAI` - OpenAI feature flag
3. `USE_OPENAI_EMBEDDINGS` - OpenAI embeddings flag
4. `GEMINI_EMBEDDING_MODEL` - Gemini embedding model
5. `OPENAI_EMBEDDING_MODEL` - OpenAI embedding model
6. `NEXTAUTH_URL` - NextAuth base URL
7. `TAVILY_API_KEY` - Tavily search API

## Testing

Setelah update .env, jalankan:

```bash
npm run build
```

Pastikan tidak ada error TypeScript atau missing environment variables.
