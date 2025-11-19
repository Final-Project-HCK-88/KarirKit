"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0c1b8a] shadow-sm border-b border-[#0c1b8a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href={"/"} className="flex items-center space-x-3">
            <Image
              src="/kaka.png"
              alt="KarirKit Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
              unoptimized
            />
            <span className="text-2xl font-bold text-white">KarirKit</span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className="hidden sm:inline-block text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/history"
                  className="hidden sm:inline-block text-sm font-medium text-white/90 hover:text-white transition-colors"
                >
                  History
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-xl border-white/50 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#0c1b8a] font-medium transition-all cursor-pointer"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white/90 hover:text-white hover:bg-white/10 font-medium"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-[#0c1b8a] hover:bg-white/90 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
