"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Sparkles,
} from "lucide-react";

interface UploadResult {
  url: string;
  viewUrl: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  resumeId: string;
  textLength: number;
}

interface CVAnalysis {
  summary: string;
  contractInfo?: {
    position: string;
    company: string;
    contractType: string;
    startDate: string;
    duration: string;
  };
  salary?: {
    amount: string;
    currency: string;
    frequency: string;
    additionalBenefits: string[];
  };
  workingConditions?: {
    workingHours: string;
    location: string;
    remotePolicy: string;
  };
  keyTerms?: Array<{
    term: string;
    description: string;
  }>;
  warnings?: Array<{
    severity: string;
    clause: string;
    issue: string;
    recommendation: string;
  }>;
  redFlags?: string[];
  recommendations: string;
}

export default function UploadPdfComponent() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validasi PDF
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      // Validasi size
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(
          "Server returned invalid response. Please check server logs."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setResult(data.data);
      setFile(null);
      // Reset input file
      const fileInput = document.getElementById(
        "pdf-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeCV = async () => {
    if (!result?.resumeId) return;

    setAnalyzing(true);
    setError("");

    try {
      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId: result.resumeId }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server error. Check console for details.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      setAnalysis(data.data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSummarize = async () => {
    if (!result?.resumeId) return;

    setSummarizing(true);
    setError("");

    try {
      const response = await fetch("/api/summarize-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId: result.resumeId }),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server error. Check console for details.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Summarization failed");
      }

      setSummary(data.data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF Contract
          </CardTitle>
          <CardDescription>
            Upload your contract document for analysis (PDF only, max 10MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-2">
                  <p className="font-medium">
                    {file ? "File selected" : "Drag and drop your file here"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>
            <Button variant="outline" asChild>
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Upload Successful!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>File:</strong> {result.fileName}
                  </p>
                  <p>
                    <strong>Size:</strong> {(result.fileSize / 1024).toFixed(2)}{" "}
                    KB
                  </p>
                  <p>
                    <strong>Extracted Text:</strong> {result.textLength}{" "}
                    characters
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={result.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View PDF
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.url} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAnalyzeCV}
                    disabled={analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="mr-2 h-4 w-4" />
                        Analyze Contract
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={summarizing}
                  >
                    {summarizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Summarizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Summarize
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Summary Result */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Document Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap text-muted-foreground">
              {summary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV Analysis Result */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Contract Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>

            {/* Contract Info */}
            {analysis.contractInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Position:</strong> {analysis.contractInfo.position}
                  </p>
                  <p>
                    <strong>Company:</strong> {analysis.contractInfo.company}
                  </p>
                  <p>
                    <strong>Type:</strong> {analysis.contractInfo.contractType}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {analysis.contractInfo.startDate}
                  </p>
                  <p>
                    <strong>Duration:</strong> {analysis.contractInfo.duration}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Salary */}
            {analysis.salary && (
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="text-base">Salary & Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Amount:</strong> {analysis.salary.amount}{" "}
                    {analysis.salary.currency}
                  </p>
                  <p>
                    <strong>Frequency:</strong> {analysis.salary.frequency}
                  </p>
                  {analysis.salary.additionalBenefits &&
                    analysis.salary.additionalBenefits.length > 0 && (
                      <div>
                        <strong>Benefits:</strong>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {analysis.salary.additionalBenefits.map(
                            (benefit, index) => (
                              <li key={index}>{benefit}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Working Conditions */}
            {analysis.workingConditions && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-base">
                    Working Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Hours:</strong>{" "}
                    {analysis.workingConditions.workingHours}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {analysis.workingConditions.location}
                  </p>
                  <p>
                    <strong>Remote Policy:</strong>{" "}
                    {analysis.workingConditions.remotePolicy}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-400 dark:border-yellow-900 border-2">
                <CardHeader>
                  <CardTitle className="text-base text-yellow-900 dark:text-yellow-200">
                    Warnings & Risk Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${
                        warning.severity === "high"
                          ? "bg-red-100 dark:bg-red-950 border-red-600"
                          : warning.severity === "medium"
                          ? "bg-orange-100 dark:bg-orange-950 border-orange-600"
                          : "bg-yellow-100 dark:bg-yellow-950 border-yellow-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            warning.severity === "high"
                              ? "bg-red-600 text-white"
                              : warning.severity === "medium"
                              ? "bg-orange-600 text-white"
                              : "bg-yellow-600 text-white"
                          }`}
                        >
                          {warning.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        <strong>Clause:</strong> &ldquo;{warning.clause}&rdquo;
                      </p>
                      <p className="text-sm mb-1">
                        <strong>Issue:</strong> {warning.issue}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Recommendation:</strong>{" "}
                        {warning.recommendation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Red Flags */}
            {analysis.redFlags && analysis.redFlags.length > 0 && (
              <Card className="bg-red-50 dark:bg-red-950 border-red-600 dark:border-red-900 border-2">
                <CardHeader>
                  <CardTitle className="text-base text-red-900 dark:text-red-200">
                    Red Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1 text-red-700 dark:text-red-300">
                    {analysis.redFlags.map((flag, index) => (
                      <li key={index} className="font-medium">
                        {flag}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Key Terms */}
            {analysis.keyTerms && analysis.keyTerms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.keyTerms.map((term, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary pl-3 py-1"
                    >
                      <p className="font-medium text-sm">{term.term}</p>
                      <p className="text-xs text-muted-foreground">
                        {term.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="text-base">
                    Overall Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {analysis.recommendations}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
