# 🔍 Analisis Inkonsistensi Backend KarirKit

**Tanggal Analisis:** November 17, 2025  
**Scope:** Backend API Routes & Helpers

---

## 📊 Summary

Ditemukan **7 kategori inkonsistensi** dalam kode backend yang perlu diperbaiki untuk meningkatkan konsistensi, maintainability, dan keamanan aplikasi.

---

## 🚨 Inkonsistensi yang Ditemukan

### 1. ❌ Inkonsistensi Response Method

**Masalah:** Beberapa API menggunakan `Response.json()` sementara yang lain menggunakan `NextResponse.json()`

**Detail:**

- **Profile API** (`/api/profile/route.ts`): Menggunakan `new Response()`
- **Login API** (`/api/login/route.ts`): Menggunakan `Response.json()`
- **Match-making, Salary-benchmark**: Menggunakan `NextResponse.json()`

**File yang terpengaruh:**

```typescript
// ❌ INCONSISTENT
// profile/route.ts
return new Response(JSON.stringify({ ... }), { status: 200 });

// login/route.ts
return Response.json({ ... }, { status: 200 });

// match-making/route.ts
return NextResponse.json({ ... }, { status: 201 });
```

**Rekomendasi:** Standardisasi ke `NextResponse.json()` karena:

- Lebih modern dan Next.js specific
- Better TypeScript support
- Consistent dengan mayoritas kode

---

### 2. ❌ Inkonsistensi JWT Token Payload

**Masalah:** Token JWT menyimpan `id` dan `email`, tapi verifikasi mengharapkan `userId` dan `email`

**Detail di UserModel.ts:**

```typescript
// Line 56 - SIGN TOKEN
const token = signToken({ id: user._id, email: user.email });
//                         ^^^ menggunakan "id"
```

**Detail di API Routes:**

```typescript
// match-making/route.ts - Line 21
const decoded = verifyToken(token) as { userId: string };
//                                      ^^^^^^ mengharapkan "userId"

// profile/route.ts - Line 19
const decoded = verifyToken(token) as { email: string };
//                                      ^^^^^ hanya menggunakan email

// sallary-benchmark/route.ts - Line 20
const decoded = verifyToken(token) as { userId?: string };
//                                      ^^^^^^ mengharapkan "userId"
```

**Impact:**

- `match-making` dan `sallary-benchmark` API akan menerima `userId = undefined`
- Menyebabkan potensi bug karena userId tidak terisi
- Profile API masih bisa berfungsi karena hanya butuh email

**Rekomendasi:** Ubah payload token menjadi:

```typescript
const token = signToken({
  userId: user._id.toString(),
  email: user.email,
});
```

---

### 3. ⚠️ Inkonsistensi Error Message

**Masalah:** Pesan error tidak konsisten untuk case yang sama

**Contoh Authorization Error:**

```typescript
// profile/route.ts
"Unauthorized. Please provide valid token.";

// match-making/route.ts
"Unauthorized. Please login first.";

// sallary-benchmark/route.ts (di catch)
"Invalid or expired token";

// match-making/route.ts (di catch)
"Invalid or expired token. Please login again.";
```

**Rekomendasi:** Standardisasi error messages:

```typescript
// 401 - No token
"Unauthorized. Authentication token required.";

// 401 - Invalid token
"Invalid or expired token. Please login again.";
```

---

### 4. ❌ Inkonsistensi Error Handling

**Masalah:** Beberapa API menggunakan `errorHandler()`, yang lain tidak

**File dengan errorHandler:**

- ✅ `/api/login/route.ts`
- ✅ `/api/register/route.ts`
- ✅ `/api/match-making/route.ts`
- ✅ `/api/sallary-benchmark/route.ts`

**File tanpa errorHandler:**

- ❌ `/api/profile/route.ts` - Manual error handling
- ❌ `/api/logout/route.ts` - Manual error handling

**Contoh Inkonsistensi:**

```typescript
// ❌ profile/route.ts - Manual handling
catch (error: unknown) {
  return new Response(
    JSON.stringify({ message: error.message || "Internal Error" }),
    { status: error.status || 500 }
  );
}

// ✅ login/route.ts - Using errorHandler
catch (error) {
  return errorHandler(error);
}
```

**Rekomendasi:** Gunakan `errorHandler()` di semua API endpoints untuk konsistensi

---

### 5. ⚠️ Inkonsistensi Type Annotations

**Masalah:** Beberapa tempat menggunakan type assertion yang berbeda

**Detail:**

```typescript
// match-making/route.ts - Line 21
const decoded = verifyToken(token) as { userId: string };
// userId: string (REQUIRED)

// sallary-benchmark/route.ts - Line 20
const decoded = verifyToken(token) as { userId?: string };
// userId?: string (OPTIONAL)

// profile/route.ts - Line 19
const decoded = verifyToken(token) as { email: string };
// Hanya email, tidak ada userId
```

**Impact:**

- TypeScript tidak bisa catch potential undefined values
- Runtime error potensial

**Rekomendasi:** Buat interface yang konsisten:

```typescript
interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

const decoded = verifyToken(token) as JWTPayload;
```

---

### 6. ⚠️ Inkonsistensi Try-Catch Structure

**Masalah:** Nested try-catch yang tidak konsisten untuk token verification

**Detail:**

```typescript
// ❌ match-making/route.ts - Double try-catch
export async function POST(request: NextRequest) {
  try {
    // Outer try
    let userId: string;
    try {
      // Inner try untuk token verification
      const token = authHeader.substring(7);
      const decoded = verifyToken(token) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      // Inner catch
      return NextResponse.json(...);
    }
    // ... rest of code
  } catch (error) {
    // Outer catch
    return errorHandler(error);
  }
}
```

**Rekomendasi:** Simplify - tidak perlu nested try-catch:

```typescript
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Authentication token required." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token) as JWTPayload;
    const userId = decoded.userId;

    // ... rest of code
  } catch (error) {
    return errorHandler(error);
  }
}
```

---

### 7. ⚠️ Inkonsistensi Variable Naming

**Masalah:** Nama variabel untuk user ID tidak konsisten

**Detail:**

```typescript
// match-making/route.ts - Line 18
let userId: string;

// sallary-benchmark/route.ts - Line 17
let userId: string | undefined;

// match-making/[id]/route.ts - Line 32
let loggedInUserId: string;
```

**Rekomendasi:** Gunakan `userId` secara konsisten, atau `loggedInUserId` jika perlu membedakan

---

## 🔧 Action Items

### Priority 1 (CRITICAL - Bug Risk)

1. **Fix JWT Token Payload** ⚠️
   - File: `db/models/UserModel.ts`
   - Line: 56
   - Change: `{ id: user._id }` → `{ userId: user._id.toString() }`

### Priority 2 (HIGH - Consistency)

2. **Standardize Response Method**

   - Files: `app/api/profile/route.ts`, `app/api/login/route.ts`
   - Change: Use `NextResponse.json()` everywhere

3. **Implement errorHandler Everywhere**
   - Files: `app/api/profile/route.ts`, `app/api/logout/route.ts`
   - Change: Replace manual error handling with `errorHandler()`

### Priority 3 (MEDIUM - Code Quality)

4. **Create JWT Payload Interface**

   - File: `helpers/jwt.ts` atau `types/jwt.d.ts`
   - Action: Define interface dan gunakan di semua API

5. **Standardize Error Messages**

   - Files: All API routes
   - Action: Create constants untuk error messages

6. **Simplify Try-Catch Structure**
   - Files: `match-making/route.ts`, `sallary-benchmark/route.ts`
   - Action: Remove nested try-catch

### Priority 4 (LOW - Nice to Have)

7. **Consistent Variable Naming**
   - Files: All API routes
   - Action: Use `userId` consistently

---

## 📝 Recommended Code Standards

### 1. Standard Response Format

```typescript
import { NextResponse } from "next/server";

// Success
return NextResponse.json({ message: "Success", data: result }, { status: 200 });

// Error - use errorHandler
return errorHandler(error);
```

### 2. Standard Auth Check

```typescript
import { verifyToken } from "@/helpers/jwt";
import { JWTPayload } from "@/types/jwt";

const authHeader = request.headers.get("authorization");

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return NextResponse.json(
    { message: "Unauthorized. Authentication token required." },
    { status: 401 }
  );
}

const token = authHeader.substring(7);
const decoded = verifyToken(token) as JWTPayload;
const userId = decoded.userId;
```

### 3. Standard Error Handling

```typescript
try {
  // API logic here
} catch (error) {
  return errorHandler(error);
}
```

---

## 📊 Impact Analysis

### Current State

- **Bug Risk:** HIGH (JWT payload mismatch)
- **Maintainability:** MEDIUM (inconsistent patterns)
- **Code Quality:** MEDIUM (mixed standards)

### After Fixes

- **Bug Risk:** LOW
- **Maintainability:** HIGH
- **Code Quality:** HIGH

---

## 🎯 Next Steps

1. **Review** inkonsistensi dengan team
2. **Prioritize** fixes berdasarkan impact
3. **Create** pull request untuk setiap kategori
4. **Test** thoroughly setelah changes
5. **Document** standards untuk future development

---

**Catatan:** Analisis ini fokus pada backend API routes. Frontend dan middleware belum termasuk dalam scope analisis ini.
