import { type Response } from "express";
import { type Request as JWTRequest } from "express-jwt";
import { prisma } from "../db/prisma.ts";

const getUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id; // Get the userId from the JWT token

  // Check if the userId and the id in the request are the same
  if (userId !== req.params.id) {
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

  return res.status(200).json({ status: "success", data: { user } });
};

const updateUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;

  // Check if the userId and the id in the request are the same
  if (userId !== req.params.id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: req.body,
  });

  // Check the user was updated
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  return res.status(200).json({ status: "success", data: { user } });
};

const deleteUser = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;

  // Check if the userId and the id in the request are the same
  if (userId !== req.params.id) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Delete the user
  const user = await prisma.user.delete({
    where: { id: userId },
  });

  // Check the user was deleted
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  return res.status(200).json({
    status: "success",
    data: { message: "User deleted successfully" },
  });
};

export { getUser, updateUser, deleteUser };
