"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { ContractAnalysisResult } from "@/components/contract-analysis-result";
import UploadPdfComponent from "@/components/UploadPdfComponent";

interface AnalysisResult {
  redFlags: string[];
  goodPoints: string[];
  importantClauses: string[];
  summary: string;
}

export default function ContractAnalysisPage() {
  const [step, setStep] = useState<"upload" | "analyzing" | "result">("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const router = useRouter();

  const handleAnalyze = async () => {
    setStep("analyzing");

    // Simulate API call
    setTimeout(() => {
      setResult({
        summary:
          "This is a standard software engineer contract with competitive benefits. Key highlights include a 3-year non-compete clause and stock options vesting over 4 years.",
        redFlags: [
          "Non-compete clause covers 3 years (industry standard is 1-2 years)",
          "IP assignment clause is very broad - may include personal projects",
          "No severance clause specified",
        ],
        goodPoints: [
          "Competitive salary with 20% annual bonus",
          "4-year stock vesting with 1-year cliff",
          "Unlimited PTO policy",
          "Full health, dental, vision coverage",
          "Professional development budget: $5000/year",
        ],
        importantClauses: [
          "Job Title: Senior Software Engineer",
          "Location: Remote (primary), San Francisco (optional)",
          "Contract Duration: Indefinite (At-will)",
          "Notice Period: 2 weeks required for termination",
          "Sign-on Bonus: $50,000",
        ],
      });
      setStep("result");
    }, 2000);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      {step === "upload" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analyze Contract</h1>
            <p className="text-muted-foreground">
              Upload a job contract or offering letter to analyze for red flags
              and benefits
            </p>
          </div>

          <UploadPdfComponent />
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
          <Loader className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">
            Analyzing your contract with AI...
          </p>
        </div>
      )}

      {step === "result" && result && (
        <ContractAnalysisResult
          result={result}
          onReset={() => {
            setStep("upload");
            setResult(null);
          }}
        />
      )}
    </div>
  );
}
