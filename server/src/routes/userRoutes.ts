import express from "express";
import {
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userControllers.ts";

const router = express.Router();

// No :id since we're getting the user from the JWT token

// GET
router.get("/", getUser);

// PUT
router.put("/", updateUser);

// DELETE
router.delete("/", deleteUser);

export default router;
