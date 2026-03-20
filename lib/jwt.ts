import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback_secret_key"
);

export interface TokenPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Generate JWT token
 */
export const signToken = async (payload: Omit<TokenPayload, keyof JWTPayload>): Promise<string> => {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
};

/**
 * Verify & decode JWT token
 */
export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, secret);
  return payload as TokenPayload;
};
