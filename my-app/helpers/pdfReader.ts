// Use legacy build for Node.js environment to avoid DOMMatrix error
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Configure worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
  try {
    console.log("📥 Fetching PDF from URL:", pdfUrl);

    // Download PDF dari URL
    const response = await fetch(pdfUrl);

    console.log("📊 Response status:", response.status);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    // Cek content type
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);

    if (
      contentType &&
      !contentType.includes("pdf") &&
      !contentType.includes("octet-stream")
    ) {
      // Kemungkinan bukan PDF, coba baca sebagai text untuk debug
      const text = await response.text();
      console.error("❌ Received non-PDF content:", text.substring(0, 200));
      throw new Error(
        `Expected PDF but got ${contentType}. Response: ${text.substring(
          0,
          100
        )}`
      );
    }

    // Convert response ke buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("📦 Buffer size:", buffer.length, "bytes");

    // Extract text dari PDF using pdfjs-dist
    return await extractTextFromPDFBuffer(buffer);
  } catch (error) {
    console.error("❌ Error extracting text from PDF:", error);
    throw error;
  }
}

// Extract text from PDF buffer using pdfjs-dist
export async function extractTextFromPDFBuffer(
  buffer: Buffer
): Promise<string> {
  try {
    // Convert Buffer to Uint8Array for pdfjs-dist
    const uint8Array = new Uint8Array(buffer);

    console.log("🔍 Loading PDF document...");

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;

    console.log(`📄 PDF loaded: ${pdfDocument.numPages} pages`);

    // Extract text from all pages
    const textPromises: Promise<string>[] = [];

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const pagePromise = pdfDocument.getPage(pageNum).then(async (page) => {
        const textContent = await page.getTextContent();
        // @ts-expect-error - pdfjs-dist TextItem type
        const pageText = textContent.items.map((item) => item.str).join(" ");
        return pageText;
      });
      textPromises.push(pagePromise);
    }

    const pagesText = await Promise.all(textPromises);
    const fullText = pagesText.join("\n\n");

    console.log(`✅ Extracted ${fullText.length} characters from PDF`);

    if (!fullText.trim()) {
      throw new Error("No text content found in PDF");
    }

    return fullText;
  } catch (error) {
    console.error("❌ Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
