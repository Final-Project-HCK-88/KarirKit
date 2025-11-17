"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader } from "lucide-react"
import { JobMatchingResult } from "@/components/job-matching-result"

interface MatchingResult {
  matchScore: number
  skillsRequired: string[]
  skillsYouHave: string[]
  skillGaps: string[]
  responsibility: string
  recommendations: string[]
}

export default function JobMatchingPage() {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input")
  const [result, setResult] = useState<MatchingResult | null>(null)

  const handleAnalyze = async () => {
    setStep("analyzing")

    // Simulate API call
    setTimeout(() => {
      setResult({
        matchScore: 82,
        skillsRequired: ["React.js", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "System Design"],
        skillsYouHave: ["React.js", "TypeScript", "Node.js", "PostgreSQL"],
        skillGaps: ["AWS", "Docker", "System Design"],
        responsibility: "Lead full-stack development for a SaaS platform with high availability requirements",
        recommendations: [
          "Your core skills match the role very well (82% match)",
          "Focus on learning AWS services - critical for this role",
          "Take a Docker/Kubernetes course to complete your DevOps knowledge",
          "Study system design patterns for high-traffic applications",
          "This role aligns with your career progression",
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

      {step === "input" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Matching & Analysis</h1>
            <p className="text-muted-foreground">Paste a job description and see how it aligns with your skills</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the full job posting here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Paste job description here... We'll analyze required skills and responsibilities"
                className="w-full min-h-64 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                defaultValue={`We're looking for a Senior Full Stack Engineer to join our Platform team.

Requirements:
- 5+ years of experience with React.js and TypeScript
- Strong backend experience with Node.js
- Database design experience with PostgreSQL
- AWS services experience (EC2, RDS, S3, Lambda)
- Docker and Kubernetes knowledge
- System design and architecture skills
- Experience with microservices architecture

Responsibilities:
- Design and implement scalable backend systems
- Lead development of new features
- Mentor junior engineers
- Participate in code reviews
- Collaborate with product and design teams`}
              />

              <Button className="w-full" onClick={handleAnalyze}>
                Analyze Job & Match Skills
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Analyzing job description and calculating match score...</p>
        </div>
      )}

      {step === "result" && result && (
        <JobMatchingResult
          result={result}
          onReset={() => {
            setStep("input")
            setResult(null)
          }}
        />
      )}
    </div>
  )
}
