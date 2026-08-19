import express from "express";
import {
  signup,
  login,
  logout,
  forgotPassword,
} from "../controllers/authControllers.ts";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);

export default router;
