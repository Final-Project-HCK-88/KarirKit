"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Loader } from "lucide-react"
import { SalaryBenchmarkResult } from "@/components/salary-benchmark-result"

interface SalaryData {
  min: number
  median: number
  max: number
  yourSalary: number
  status: "below" | "fair" | "above"
  recommendations: string[]
  salaryTrend: number
}

export default function SalaryBenchmarkPage() {
  const [step, setStep] = useState<"form" | "analyzing" | "result">("form")
  const [formData, setFormData] = useState({
    jobTitle: "",
    location: "",
    experience: "",
    currentSalary: "",
  })
  const [result, setResult] = useState<SalaryData | null>(null)

  const handleAnalyze = async () => {
    if (!formData.jobTitle || !formData.location || !formData.experience) {
      alert("Please fill in all required fields")
      return
    }

    setStep("analyzing")

    // Simulate API call
    setTimeout(() => {
      const current = Number.parseFloat(formData.currentSalary || "100000")
      setResult({
        min: 120000,
        median: 150000,
        max: 180000,
        yourSalary: current,
        status: current < 150000 ? "below" : current > 165000 ? "above" : "fair",
        salaryTrend: 8,
        recommendations: [
          `Your salary is ${current < 150000 ? "below" : "above"} the market median for ${formData.jobTitle} in ${formData.location}`,
          `With ${formData.experience} years of experience, you could negotiate for $${Math.round((150000 + 180000) / 2).toLocaleString()}`,
          "Consider highlighting unique skills to justify higher compensation",
          "Remote work typically commands 5-10% higher salaries in major tech hubs",
        ],
      })
      setStep("result")
    }, 2000)
  }

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {step === "form" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Salary Benchmark</h1>
            <p className="text-muted-foreground">Get market insights and negotiation recommendations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>Help us calculate the right market range for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Years of Experience *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current/Offered Salary (Optional)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 150000"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData({ ...formData, currentSalary: e.target.value })}
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleAnalyze}>
                Get Benchmark
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Analyzing salary market data...</p>
        </div>
      )}

      {step === "result" && result && (
        <SalaryBenchmarkResult
          result={result}
          jobTitle={formData.jobTitle}
          onReset={() => {
            setStep("form")
            setResult(null)
          }}
        />
      )}
    </div>
  )
}
