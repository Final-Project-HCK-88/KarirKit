import jwt from "jsonwebtoken"
const secretKey = process.env.JWT_SECRET || "your-default-secret-key";

export const signToken = (payload: object) => {
  return jwt.sign(payload, secretKey);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, secretKey);
  } catch {
    throw { message: "Invalid or expired token", status: 401 };
  }
};
