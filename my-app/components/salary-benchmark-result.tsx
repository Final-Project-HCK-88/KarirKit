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

export function SalaryBenchmarkResult({
  result,
  jobTitle,
  onReset,
}: {
  result: SalaryData;
  jobTitle: string;
  onReset: () => void;
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
