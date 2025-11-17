/**
 * Authentication Helper untuk KarirKit Client-Side
 *
 * Helper ini menyediakan fungsi-fungsi untuk mengelola authentication
 * menggunakan JWT Bearer Token yang disimpan di localStorage
 */

const TOKEN_KEY = "karirkit_access_token";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==================== TOKEN MANAGEMENT ====================

/**
 * Simpan token ke localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Ambil token dari localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Hapus token dari localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Check apakah user sudah login (ada token)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ==================== API HELPERS ====================

/**
 * Get default headers dengan Authorization token
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Get headers untuk multipart/form-data dengan Authorization
 */
export const getAuthHeadersMultipart = (): HeadersInit => {
  const token = getToken();
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Jangan set Content-Type untuk multipart, browser akan set otomatis dengan boundary
  return headers;
};

// ==================== AUTH API CALLS ====================

interface RegisterData {
  fullname: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  access_token?: string;
  data?: {
    _id?: string;
    fullname?: string;
    email?: string;
  };
}

/**
 * Register user baru
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
};

/**
 * Login dan simpan token
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  // Simpan token ke localStorage
  if (result.access_token) {
    setToken(result.access_token);
  }

  return result;
};

/**
 * Logout dan hapus token
 */
export const logout = async (): Promise<void> => {
  try {
    // Optional: call server logout endpoint
    await fetch(`${BASE_URL}/api/logout`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    // Selalu hapus token dari localStorage
    removeToken();
  }
};

// ==================== PROTECTED API CALLS ====================

/**
 * Generic function untuk protected API calls
 */
export const fetchProtected = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok) {
    // Jika unauthorized, hapus token dan redirect ke login
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new Error(result.message || "API call failed");
  }

  return result;
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<unknown> => {
  return fetchProtected("/api/profile", {
    method: "GET",
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (formData: FormData): Promise<unknown> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found. Please login.");
  }

  const response = await fetch(`${BASE_URL}/api/profile`, {
    method: "PUT",
    headers: getAuthHeadersMultipart(),
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new Error(result.message || "Profile update failed");
  }

  return result;
};

// ==================== EXPORTS ====================

const authClient = {
  // Token management
  setToken,
  getToken,
  removeToken,
  isAuthenticated,

  // Headers
  getAuthHeaders,
  getAuthHeadersMultipart,

  // Auth APIs
  register,
  login,
  logout,

  // Protected APIs
  fetchProtected,
  getProfile,
  updateProfile,
};

export default authClient;
