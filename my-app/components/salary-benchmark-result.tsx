"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SalaryData {
  min: number;
  median: number;
  max: number;
  yourSalary: number;
  status: "below" | "fair" | "above";
  recommendations: string[];
  salaryTrend: number;
}

interface Sources {
  primary: string;
  secondary: string[];
}

export function SalaryBenchmarkResult({
  result,
  jobTitle,
  onReset,
  sources,
}: {
  result: SalaryData;
  jobTitle: string;
  onReset: () => void;
  sources?: Sources;
}) {
  const chartData = [
    {
      name: "Market Range",
      min: result.min,
      median: result.median,
      max: result.max,
    },
    { name: "Your Salary", salary: result.yourSalary },
  ];

  const statusColor =
    result.status === "below"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      : result.status === "above"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Salary Analysis</h1>
        <p className="text-muted-foreground">Market insights for {jobTitle}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Minimum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {(result.min / 1000000).toFixed(1)}jt
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Median
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              Rp {(result.median / 1000000).toFixed(1)}jt
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Market Maximum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {(result.max / 1000000).toFixed(1)}jt
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                result.status === "below"
                  ? "text-yellow-600"
                  : result.status === "above"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              Rp {(result.yourSalary / 1000000).toFixed(1)}jt
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Badge */}
      <div className={`p-4 rounded-lg ${statusColor}`}>
        <p className="font-semibold">
          {result.status === "below" && "Your salary is below market average"}
          {result.status === "fair" && "Your salary is fair and competitive"}
          {result.status === "above" && "Your salary is above market average"}
        </p>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Range Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: "Min", value: result.min },
                { name: "Median", value: result.median },
                { name: "Max", value: result.max },
                { name: "You", value: result.yourSalary },
              ]}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => {
                  const millions = value / 1000000;
                  return `${millions.toFixed(0)} JT`;
                }}
                width={80}
              />
              <Tooltip
                formatter={(value) =>
                  `Rp ${((value as number) / 1000000).toFixed(1)} Juta`
                }
              />
              <Bar dataKey="value" fill="#3b82f6">
                {[0, 1, 2, 3].map((index) => (
                  <Cell
                    key={index}
                    fill={index === 3 ? "#10b981" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Negotiation Recommendations</CardTitle>
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

      {/* Data Sources Disclaimer */}
      {sources && (
        <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">ℹ️</span>
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Primary Source */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Primary Source:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📊 {sources.primary}
              </p>
            </div>

            {/* Secondary Sources */}
            {sources.secondary && sources.secondary.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Additional Web Sources (via Tavily AI):
                </p>
                <ul className="space-y-2">
                  {sources.secondary.map((source, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-300 dark:border-gray-700"
                    >
                      {source.startsWith("http") ? (
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                        >
                          🔗 {source}
                        </a>
                      ) : (
                        <span>📄 {source}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                💡 This salary benchmark is generated using AI-powered analysis
                combining authoritative salary surveys and real-time web data.
                Results should be used as guidance only and may vary based on
                company size, benefits, and specific job requirements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onReset}>Search Another Salary</Button>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
