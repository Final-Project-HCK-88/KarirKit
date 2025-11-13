import cloudinary from "@/db/config/cloudinary";

export async function uploadPdfToCloudinary(
  file: File
): Promise<{ url: string; publicId: string }> {
  try {
    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto", // Auto detect resource type
            folder: "karirkit/resumes", // Folder di Cloudinary
            type: "upload", // Public upload
            access_mode: "public", // Make file publicly accessible
            invalidate: true, // Invalidate CDN cache
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(new Error("Upload failed"));
            }
          }
        )
        .end(buffer);
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function deletePdfFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}
