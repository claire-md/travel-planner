import { type Response } from "express";
import { type Request as JWTRequest } from "express-jwt";
import { prisma } from "../db/prisma.ts";
import { findOwnedItinerary } from "../utils/ownership.ts";
import { parseTime } from "../utils/parseTime.ts";

const getActivities = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const itineraryId = req.params.itineraryId as string;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check the itinerary exists and belongs to the user
  const itinerary = await findOwnedItinerary(itineraryId, userId);

  if (!itinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Get the activities for the itinerary
  const activities = await prisma.activity.findMany({
    where: { itineraryId },
    orderBy: { startTime: "asc" },
  });

  return res.status(200).json({ status: "success", data: { activities } });
};

const createActivity = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const itineraryId = req.params.itineraryId as string;
  const { title, location } = req.body;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check the title, location, startTime and endTime are provided
  if (!title || !location || !req.body.startTime || !req.body.endTime) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  const startTime = parseTime(req.body.startTime);
  const endTime = parseTime(req.body.endTime);

  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ status: "error", message: "Times must be in HH:MM format" });
  }

  if (endTime < startTime) {
    return res.status(400).json({
      status: "error",
      message: "End time cannot be before start time",
    });
  }

  // Check the itinerary exists and belongs to the user
  const itinerary = await findOwnedItinerary(itineraryId, userId);

  if (!itinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Create the activity
  const activity = await prisma.activity.create({
    data: { title, location, startTime, endTime, itineraryId },
  });

  return res.status(201).json({ status: "success", data: { activity } });
};

const updateActivity = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const itineraryId = req.params.itineraryId as string;
  const activityId = req.params.activityId as string;
  const { title, location } = req.body;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check the title, location, startTime and endTime are provided
  if (!title || !location || !req.body.startTime || !req.body.endTime) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required" });
  }

  const startTime = parseTime(req.body.startTime);
  const endTime = parseTime(req.body.endTime);

  if (!startTime || !endTime) {
    return res
      .status(400)
      .json({ status: "error", message: "Times must be in HH:MM format" });
  }

  if (endTime < startTime) {
    return res.status(400).json({
      status: "error",
      message: "End time cannot be before start time",
    });
  }

  // Check the itinerary exists and belongs to the user
  const itinerary = await findOwnedItinerary(itineraryId, userId);

  if (!itinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Check the activity exists and belongs to the itinerary
  const existingActivity = await prisma.activity.findFirst({
    where: { id: activityId, itineraryId },
  });

  if (!existingActivity) {
    return res
      .status(404)
      .json({ status: "error", message: "Activity not found" });
  }

  // Update the activity
  const activity = await prisma.activity.update({
    where: { id: activityId },
    data: { title, location, startTime, endTime },
  });

  return res.status(200).json({ status: "success", data: { activity } });
};

const deleteActivity = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const itineraryId = req.params.itineraryId as string;
  const activityId = req.params.activityId as string;

  // Check there's a userId
  if (!userId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check the itinerary exists and belongs to the user
  const itinerary = await findOwnedItinerary(itineraryId, userId);

  if (!itinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Check the activity exists and belongs to the itinerary
  const existingActivity = await prisma.activity.findFirst({
    where: { id: activityId, itineraryId },
  });

  if (!existingActivity) {
    return res
      .status(404)
      .json({ status: "error", message: "Activity not found" });
  }

  // Delete the activity
  const activity = await prisma.activity.delete({
    where: { id: activityId },
  });

  return res.status(200).json({ status: "success", data: { activity } });
};

export { getActivities, createActivity, updateActivity, deleteActivity };
