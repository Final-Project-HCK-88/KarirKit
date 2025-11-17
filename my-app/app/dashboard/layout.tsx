import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">{children}</main>
    </ProtectedRoute>
  )
}
