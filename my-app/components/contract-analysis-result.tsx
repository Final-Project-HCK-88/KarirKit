"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  RotateCw,
} from "lucide-react";
import Link from "next/link";

interface AnalysisResult {
  summary: string;
  redFlags: string[];
  goodPoints: string[];
  importantClauses: string[];
}

export function ContractAnalysisResult({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analysis Complete</h1>
          <p className="text-muted-foreground">
            Here's what we found in your contract
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCw className="h-4 w-4 mr-2" /> Analyze Another
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" /> Red Flags
          </CardTitle>
          <CardDescription>Clauses that may need negotiation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.redFlags.map((flag, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-destructive font-bold">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Good Points */}
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" /> Good Points
          </CardTitle>
          <CardDescription>Benefits and favorable terms</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.goodPoints.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-green-600 dark:text-green-400 font-bold">
                  ✓
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Important Clauses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Important Clauses
          </CardTitle>
          <CardDescription>Key terms to remember</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.importantClauses.map((clause, i) => (
              <li
                key={i}
                className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
              >
                <span className="text-primary font-bold">{i + 1}.</span>
                <span>{clause}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onReset}>Analyze Another Contract</Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
