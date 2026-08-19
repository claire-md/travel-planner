import { type Request, type Response } from "express";
import { prisma } from "../db/prisma.ts";
import bcrypt from "bcryptjs";
import { generateToken, clearToken } from "../utils/token.ts";

const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  // Check for empty fields
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
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

  return res.status(201).json({ status: "success", user, token });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check for empty fields
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid credentials or user does not exist" });
  }

  // Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = generateToken(res, user.id);

  return res.status(200).json({ status: "success", user, token });
};

const logout = async (req: Request, res: Response) => {
  // Clear JWT token
  clearToken(res);

  return res.status(200).json({ status: "success" });
};

// TODO: Send user an email with a link to reset password
const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check for empty fields
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  return res.status(200).json({ status: "success" });
};

export { signup, login, logout, forgotPassword };
