"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, RotateCw } from "lucide-react";
import Link from "next/link";

interface MatchingResult {
  matchScore: number;
  skillsRequired: string[];
  skillsYouHave: string[];
  skillGaps: string[];
  responsibility: string;
  recommendations: string[];
}

export function JobMatchingResult({
  result,
  onReset,
}: {
  result: MatchingResult;
  onReset: () => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900";
    if (score >= 60) return "bg-blue-100 dark:bg-blue-900";
    return "bg-yellow-100 dark:bg-yellow-900";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Match Analysis</h1>
          <p className="text-muted-foreground">
            Your alignment with this position
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

      {/* Match Score */}
      <Card className={getScoreBgColor(result.matchScore)}>
        <CardHeader>
          <CardTitle>Your Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div
              className={`text-5xl font-bold ${getScoreColor(
                result.matchScore
              )}`}
            >
              {result.matchScore}%
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {result.matchScore >= 80 &&
                "Excellent match! You are well-qualified for this role."}
              {result.matchScore >= 60 &&
                result.matchScore < 80 &&
                "Good match. Some skill gaps to address."}
              {result.matchScore < 60 &&
                "Moderate match. Consider upskilling before applying."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Required</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.skillsRequired.map((skill) => (
                <li key={skill} className="text-sm">
                  {skill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-lg text-green-600 dark:text-green-400">
              Your Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.skillsYouHave.map((skill) => (
                <li key={skill} className="text-sm flex items-center gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>{" "}
                  {skill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-600 dark:text-yellow-400">
              Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.skillGaps.map((skill) => (
                <li key={skill} className="text-sm flex items-center gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400">
                    →
                  </span>{" "}
                  {skill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Job Responsibility */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Responsibility</CardTitle>
          <CardDescription>What you'll be doing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{result.responsibility}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onReset}>Analyze Another Job</Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
