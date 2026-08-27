import express from "express";
import {
  getItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
} from "../controllers/itineraryControllers.ts";

const router = express.Router();

// GET
router.get("/:tripId", getItineraries);
router.get("/:tripId/:itineraryId", getItinerary);

// POST
router.post("/:tripId/:date", createItinerary);

// PUT
router.put("/:tripId/:itineraryId", updateItinerary);

// DELETE
router.delete("/:tripId/:itineraryId", deleteItinerary);

export default router;
