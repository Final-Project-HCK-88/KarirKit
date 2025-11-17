"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Briefcase,
  Trash2,
  Eye,
} from "lucide-react";

interface HistoryItem {
  id: string;
  type: "contract" | "salary" | "job";
  title: string;
  description: string;
  date: string;
  icon: any;
  color: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch history from API when available
    // For now, just set loading to false
    setIsLoading(false);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "contract":
        return { icon: FileText, color: "text-blue-600" };
      case "salary":
        return { icon: DollarSign, color: "text-green-600" };
      case "job":
        return { icon: Briefcase, color: "text-purple-600" };
      default:
        return { icon: FileText, color: "text-gray-600" };
    }
  };

  const handleDelete = async (id: string) => {
    // Implement delete functionality when API is available
    console.log("Delete item:", id);
  };
  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="gap-2 mb-8">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-muted-foreground">
          View your previous contract, salary, and job analyses
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <p className="text-muted-foreground">Loading history...</p>
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center pb-12">
            <p className="text-muted-foreground mb-4">
              No analyses yet. Start by using one of our tools!
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const iconData = getIcon(item.type);
            const Icon = iconData.icon;
            return (
              <Card key={item.id} className="hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className={`p-3 bg-secondary rounded-lg h-fit`}>
                        <Icon className={`h-5 w-5 ${iconData.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
