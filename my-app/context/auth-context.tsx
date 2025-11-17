"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  fullname: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullname: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (fullname: string, imageFile?: File) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include", // Ensure cookies are sent
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // User not authenticated (401/403), this is normal for logged out users
        setUser(null);
      }
    } catch {
      // Silently handle network or other errors
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    // Extract token from response and set it as "token" cookie for consistency with profile API
    if (data.access_token) {
      document.cookie = `token=${data.access_token}; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 days
    }

    // After successful login, fetch user profile
    await checkAuth();
  };

  const register = async (
    fullname: string,
    email: string,
    password: string
  ) => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullname, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    // Registration successful - don't auto login, let user go to login page
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const signInWithGoogle = async () => {
    // Redirect to NextAuth Google provider (use assign and log for easier debugging)
    try {
      // log so user can see the action in browser console
      // eslint-disable-next-line no-console
      console.log("Auth: redirecting to /api/auth/signin/google");
      window.location.assign("/api/auth/signin/google");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Auth: failed to redirect to Google sign-in", err);
      throw err;
    }
  };

  const updateProfile = async (fullname: string, imageFile?: File) => {
    const formData = new FormData();
    formData.append("fullname", fullname);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const response = await fetch("/api/profile", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    // Refresh user data after update
    await checkAuth();
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        signInWithGoogle,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
