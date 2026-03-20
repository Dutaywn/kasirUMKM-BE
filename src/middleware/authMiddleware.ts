import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../../lib/jwt";

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
