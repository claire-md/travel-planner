import express from "express";
import {
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userControllers.ts";

const router = express.Router();

// GET
router.get("/:id", getUser);

// PUT
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

export default router;
