// JWT Token Payload Type Definition
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
