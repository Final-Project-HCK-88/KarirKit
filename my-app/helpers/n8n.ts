// n8n Integration Helper

interface N8nAnalysisRequest {
  pdfUrl: string;
  resumeId: string;
  fileName: string;
  extractedText?: string; // Add extracted text
}

interface N8nAnalysisResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis?: any;
  error?: string;
}

// n8n webhook URL
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://fawwazer.app.n8n.cloud/webhook-test/analyze-cv";

export async function analyzeWithN8n(
  data: N8nAnalysisRequest
): Promise<N8nAnalysisResponse> {
  try {
    console.log("📤 Sending request to n8n webhook:", N8N_WEBHOOK_URL);
    console.log("📊 Request data:", {
      pdfUrl: data.pdfUrl.substring(0, 50) + "...",
      resumeId: data.resumeId,
      fileName: data.fileName,
      textLength: data.extractedText?.length || 0,
      textPreview: data.extractedText?.substring(0, 100) || "No text",
    });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("📥 n8n response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ n8n error response:", errorText);
      throw new Error(
        `n8n webhook failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("✅ n8n analysis completed");

    return {
      success: true,
      analysis: result,
    };
  } catch (error) {
    console.error("❌ Error calling n8n webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function summarizeWithN8n(
  data: N8nAnalysisRequest
): Promise<N8nAnalysisResponse> {
  try {
    const N8N_SUMMARIZE_URL =
      process.env.N8N_SUMMARIZE_URL ||
      N8N_WEBHOOK_URL.replace("analyze-cv", "summarize-pdf");

    console.log("📤 Sending summarize request to n8n:", N8N_SUMMARIZE_URL);

    const response = await fetch(N8N_SUMMARIZE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ n8n summarization completed");

    return {
      success: true,
      analysis: result,
    };
  } catch (error) {
    console.error("❌ Error calling n8n summarize webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
