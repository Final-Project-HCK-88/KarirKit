import vision from "@google-cloud/vision";

// Initialize Vision client dengan API key dari env
function getVisionClient() {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_VISION_API_KEY is not set in environment variables"
    );
  }

  return new vision.ImageAnnotatorClient({
    apiKey: apiKey,
  });
}

export async function extractTextFromPDFBuffer(
  buffer: Buffer
): Promise<string> {
  try {
    console.log("🔍 Extracting text with Google Vision API...");
    const client = getVisionClient();

    // Convert buffer to base64 for Vision API
    const [result] = await client.documentTextDetection({
      image: { content: buffer },
    });

    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      console.warn("⚠️ No text found in document");
      return "";
    }

    console.log(
      "✅ Text extracted successfully. Length:",
      fullTextAnnotation.text.length
    );
    return fullTextAnnotation.text;
  } catch (error) {
    console.error("❌ Error with Google Vision:", error);
    throw error;
  }
}

export async function extractTextFromImageBuffer(
  buffer: Buffer
): Promise<string> {
  try {
    const client = getVisionClient();
    const [result] = await client.documentTextDetection({
      image: { content: buffer },
    });
    const fullTextAnnotation = result.fullTextAnnotation;

    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      throw new Error("No text found in image");
    }

    return fullTextAnnotation.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw error;
  }
}
