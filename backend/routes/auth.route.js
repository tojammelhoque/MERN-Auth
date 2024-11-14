import express, { Router } from "express";
import {
  login,
  signup,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Protected route
router.get("/check-auth", verifyToken, checkAuth);

// signup route
router.post("/signup", signup);

// verify email route
router.post("/verify", verifyEmail);

// login route
router.post("/login", login);

// logout route
router.post("/logout", logout);

// forget password
router.post("/forget-password", forgetPassword);

//reset password

router.post("/reset-password/:token", resetPassword);

export default router;
