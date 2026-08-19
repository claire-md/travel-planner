import express from "express";
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../controllers/tripControllers.ts";

const router = express.Router();

// GET
router.get("/", getTrips);
router.get("/:id", getTrip);

// POST
router.post("/", createTrip);

// PUT
router.put("/:id", updateTrip);

// DELETE
router.delete("/:id", deleteTrip);

export default router;
