import { v2 as cloudinary } from "cloudinary";

// Parse Cloudinary URL
const cloudinaryUrl = process.env.cloudinary_url || "";
const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);

if (match) {
  cloudinary.config({
    cloud_name: match[3],
    api_key: match[1],
    api_secret: match[2],
    secure: true,
  });
} else {
  console.error("Invalid Cloudinary URL format");
}

export default cloudinary;
