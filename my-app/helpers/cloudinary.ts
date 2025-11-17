import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL?.split("@")[1],
  api_key: process.env.CLOUDINARY_URL?.split("//")[1]?.split(":")[0],
  api_secret: process.env.CLOUDINARY_URL?.split(":")[2]?.split("@")[0],
});

export default cloudinary;

export async function uploadPdfToCloudinary(
  file: File
): Promise<{ url: string; publicId: string; viewUrl: string }> {
  try {
    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename tanpa extension (Cloudinary akan tambahkan otomatis)
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/\.pdf$/i, "") // Hapus .pdf jika ada
      .replace(/[^a-zA-Z0-9]/g, "_") // Replace special chars dengan underscore
      .toLowerCase();
    const filename = `${sanitizedName}_${timestamp}`;

    // Upload to Cloudinary dengan format specified dan flags untuk akses
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "karirkit/resumes",
            public_id: filename,
            format: "pdf", // Specify format as pdf
            type: "upload",
            access_mode: "public",
            // Tambahkan flags untuk attachment download, bypass untrusted check
            flags: "attachment",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else if (result) {
              console.log("Upload success:", result.secure_url);
              // Cloudinary seharusnya return URL dengan .pdf
              const baseUrl = result.secure_url;

              resolve({
                url: baseUrl,
                publicId: result.public_id,
                viewUrl: baseUrl,
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
