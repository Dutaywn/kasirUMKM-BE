import { Router } from "express";
import * as authController from "../controller/authController.js";
import passport from "../middleware/passport.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  authController.googleCallback
);

router.get("/me", authMiddleware, authController.getMe);

export default router;
