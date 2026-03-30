import { Request, Response } from "express";
import * as authService from "../service/authService.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Kita tidak butuh data dari body untuk logout sederhana
    await authService.logoutUser();
    res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL}/page/login?error=auth_failed`);
  }

  const { signToken } = await import("../../lib/jwt.js");
  const token = await signToken({
    userId: user.id,
    email: user.email || "",
    role: user.role,
  });

  // Redirect to frontend with token
  res.redirect(`${process.env.FRONTEND_URL}/page/auth-success?token=${token}`);
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

