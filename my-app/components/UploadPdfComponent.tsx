"use client";

import { useState } from "react";

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload PDF Contract</h2>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label
            htmlFor="pdf-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select PDF File
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors font-medium"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
            <p className="text-sm font-semibold text-green-800">
              ✅ Upload Successful!
            </p>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>File:</strong> {result.fileName}
              </p>
              <p>
                <strong>Size:</strong> {(result.fileSize / 1024).toFixed(2)} KB
              </p>
              <p>
                <strong>Extracted Text:</strong> {result.textLength} characters
              </p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={result.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📄 View PDF
                </a>
                <a
                  href={result.url}
                  download
                  className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={handleAnalyzeCV}
                  disabled={analyzing}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  {analyzing ? "🔄 Analyzing..." : "🤖 Analyze CV"}
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                >
                  {summarizing ? "🔄 Summarizing..." : "📝 Summarize"}
                </button>
              </div>
              <p className="text-xs text-gray-500 break-all">
                <strong>Direct Link:</strong> {result.viewUrl}
              </p>
            </div>
          </div>
        )}

        {/* Summary Result */}
        {summary && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-3">
            <h3 className="text-lg font-bold text-green-900">
              📝 Document Summary
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}

        {/* CV Analysis Result */}
        {analysis && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-md space-y-3">
            <h3 className="text-lg font-bold text-purple-900">
              📊 Contract Analysis
            </h3>

            {/* Summary */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Summary:</h4>
              <p className="text-sm text-gray-700">{analysis.summary}</p>
            </div>

            {/* Contract Info */}
            {analysis.contractInfo && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-gray-800 mb-2">
                  📋 Contract Details:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
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
                </div>
              </div>
            )}

            {/* Salary */}
            {analysis.salary && (
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  💰 Salary & Benefits:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
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
                        <ul className="list-disc list-inside ml-2">
                          {analysis.salary.additionalBenefits.map(
                            (benefit, index) => (
                              <li key={index}>{benefit}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Working Conditions */}
            {analysis.workingConditions && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">
                  🏢 Working Conditions:
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Hours:</strong>{" "}
                    {analysis.workingConditions.workingHours}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {analysis.workingConditions.location}
                  </p>
                  <p>
                    <strong>Policy:</strong>{" "}
                    {analysis.workingConditions.remotePolicy}
                  </p>
                </div>
              </div>
            )}

            {/* Warnings - HIGHLIGHT */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded border-2 border-yellow-400">
                <h4 className="font-semibold text-red-800 mb-2">
                  ⚠️ Warnings & Risk Highlights:
                </h4>
                <div className="space-y-3">
                  {analysis.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border-l-4 ${
                        warning.severity === "high"
                          ? "bg-red-100 border-red-600"
                          : warning.severity === "medium"
                          ? "bg-orange-100 border-orange-600"
                          : "bg-yellow-100 border-yellow-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
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
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        <strong>Clause:</strong> &ldquo;{warning.clause}&rdquo;
                      </p>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>Issue:</strong> {warning.issue}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>💡 Recommendation:</strong>{" "}
                        {warning.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {analysis.redFlags && analysis.redFlags.length > 0 && (
              <div className="bg-red-50 p-3 rounded border-2 border-red-600">
                <h4 className="font-semibold text-red-800 mb-2">
                  🚩 Red Flags:
                </h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {analysis.redFlags.map((flag, index) => (
                    <li key={index} className="font-medium">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Terms */}
            {analysis.keyTerms && analysis.keyTerms.length > 0 && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-semibold text-gray-800 mb-2">
                  📝 Key Terms:
                </h4>
                <div className="space-y-2">
                  {analysis.keyTerms.map((term, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-purple-300 pl-3"
                    >
                      <p className="font-medium text-sm">{term.term}</p>
                      <p className="text-xs text-gray-600">
                        {term.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && (
              <div className="bg-blue-50 p-3 rounded border border-blue-300">
                <h4 className="font-semibold text-gray-800 mb-1">
                  💡 Overall Recommendations:
                </h4>
                <p className="text-sm text-gray-700">
                  {analysis.recommendations}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
