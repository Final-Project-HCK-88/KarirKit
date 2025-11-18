import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types/jwt";

const secretKey = process.env.JWT_SECRET || "your-default-secret-key";

export const signToken = (payload: object) => {
  return jwt.sign(payload, secretKey);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, secretKey) as JWTPayload;
  } catch {
    throw { message: "Invalid or expired token", status: 401 };
  }
};
