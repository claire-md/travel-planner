import { type Request, type Response } from "express";
import crypto from "crypto";
import { prisma } from "../db/prisma.ts";
import bcrypt from "bcryptjs";
import { generateToken, clearToken } from "../utils/token.ts";

// How long a password reset link stays valid.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashResetToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  // Check for empty fields
  if (!firstName || !lastName || !email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    return res
      .status(409)
      .json({ status: "error", message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    },
  });

  // Generate JWT token
  const token = generateToken(res, user.id);

  return res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
    },
  });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check for empty fields
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  // Check if user exists. Use a single generic message for both a missing user
  // and a wrong password so registered emails can't be enumerated.
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid credentials" });
  }

  // Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken(res, user.id);

  return res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      token,
    },
  });
};

const logout = async (req: Request, res: Response) => {
  // Clear JWT token
  clearToken(res);

  return res.status(200).json({ status: "success" });
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check for empty fields
  if (!email) {
    return res
      .status(400)
      .json({ status: "error", message: "Email is required" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Only issue a token when the account exists, but always return the same
  // response so this endpoint can't be used to discover registered emails.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashResetToken(token),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // No email provider is wired up yet, so log the link for local testing.
    const clientUrl =
      process.env.ENVIRONMENT === "development"
        ? process.env.DEV_CLIENT_URL
        : process.env.PROD_CLIENT_URL;

    console.log(
      `Password reset link for ${user.email}: ${clientUrl}/reset-password?token=${token}`,
    );
  }

  return res.status(200).json({
    status: "success",
    message: "If that account exists, a reset link has been sent.",
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // Check for empty fields
  if (!token || !password) {
    return res
      .status(400)
      .json({ status: "error", message: "Token and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 8 characters",
    });
  }

  // Match on the stored hash so the raw token is never persisted.
  const user = await prisma.user.findFirst({
    where: { resetTokenHash: hashResetToken(token) },
  });

  if (
    !user ||
    !user.resetTokenExpiresAt ||
    user.resetTokenExpiresAt < new Date()
  ) {
    return res.status(400).json({
      status: "error",
      message: "Reset link is invalid or has expired",
    });
  }

  // Hash the new password and clear the reset token so it can't be reused.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  return res.status(200).json({
    status: "success",
    message: "Password has been reset",
  });
};

export { signup, login, logout, forgotPassword, resetPassword };
