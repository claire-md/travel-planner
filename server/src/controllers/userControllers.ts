import { type Response } from "express";
import { type Request as JWTRequest } from "express-jwt";
import { prisma } from "../db/prisma.ts";

const getUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Get the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Check if the user exists
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  return res.status(200).json({
    status: "success",
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    },
  });
};

const updateUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const { firstName, lastName, email } = req.body;

  // Check for empty fields
  if (!firstName || !lastName || !email) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Reject a new email that another account already uses. The unique index
  // enforces this too, but an explicit check gives a clearer message.
  const emailOwner = await prisma.user.findUnique({ where: { email } });

  if (emailOwner && emailOwner.id !== userId) {
    return res
      .status(409)
      .json({ status: "error", message: "Email already in use" });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, email },
  });

  return res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    },
  });
};

const deleteUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Delete the user
  await prisma.user.delete({
    where: { id: userId },
  });

  return res.status(200).json({
    status: "success",
    data: { message: "User deleted successfully" },
  });
};

export { getUser, updateUser, deleteUser };
