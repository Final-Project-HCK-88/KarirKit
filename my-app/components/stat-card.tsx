import type React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        {trend && (
          <p
            className={`text-xs mt-4 ${
              trend >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
