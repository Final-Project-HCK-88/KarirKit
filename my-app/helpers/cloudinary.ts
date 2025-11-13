import cloudinary from "@/db/config/cloudinary";

export async function uploadPdfToCloudinary(
  file: File
): Promise<{ url: string; publicId: string; viewUrl: string }> {
  try {
    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "karirkit/resumes",
            type: "upload",
            access_mode: "public",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              // URL asli dari Cloudinary - gunakan langsung tanpa modifikasi
              const baseUrl = result.secure_url;

              resolve({
                url: baseUrl, // URL download
                publicId: result.public_id,
                viewUrl: baseUrl, // URL view (sama dengan download untuk raw files)
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
