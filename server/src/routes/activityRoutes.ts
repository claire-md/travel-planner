import express from "express";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../controllers/activityControllers.ts";

const router = express.Router();

// GET
router.get("/:itineraryId", getActivities);

// POST
router.post("/:itineraryId", createActivity);

// PUT
router.put("/:itineraryId/:activityId", updateActivity);

// DELETE
router.delete("/:itineraryId/:activityId", deleteActivity);

export default router;
