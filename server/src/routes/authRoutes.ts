import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.ts";

const router = express.Router();

// POST
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
