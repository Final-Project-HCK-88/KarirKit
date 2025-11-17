"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            AI
          </div>
          <span className="hidden sm:inline">CareerSmart</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard/profile"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/history"
                className="text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                History
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
