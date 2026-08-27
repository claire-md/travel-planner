import { type Response } from "express";
import { type Request as JWTRequest } from "express-jwt";
import { prisma } from "../db/prisma.ts";
import { calculateDay } from "../utils/calculateDay.ts";
import { findOwnedTrip } from "../utils/ownership.ts";

const getItineraries = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.tripId as string;

  // Check there's a userId and tripId
  if (!userId || !tripId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check the trip exists and belongs to the user
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip) {
    return res.status(404).json({ status: "error", message: "Trip not found" });
  }

  // Get the itineraries
  const itineraries = await prisma.itinerary.findMany({
    where: { tripId },
    orderBy: { date: "asc" },
  });

  return res.status(200).json({ status: "success", data: { itineraries } });
};

const getItinerary = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.tripId as string;
  const itineraryId = req.params.itineraryId as string;

  // Check there's a userId and tripId and itineraryId
  if (!userId || !tripId || !itineraryId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check if trip exists and belongs to the user
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip) {
    return res.status(404).json({ status: "error", message: "Trip not found" });
  }

  // Check if itinerary exists and belongs to the trip
  const itinerary = await prisma.itinerary.findUnique({
    where: { id: itineraryId, tripId },
  });

  if (!itinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  return res.status(200).json({ status: "success", data: { itinerary } });
};

const createItinerary = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.tripId as string;
  const date = new Date(req.params.date as string);

  // Check there's a userId and tripId
  if (!userId || !tripId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ status: "error", message: "Invalid date" });
  }

  // Check if trip exists and belongs to the user
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip) {
    return res.status(404).json({ status: "error", message: "Trip not found" });
  }

  // Check the date falls within the trip so the day number can't be zero or negative
  if (date < trip.startDate || date > trip.endDate) {
    return res.status(400).json({
      status: "error",
      message: "Date must fall within the trip's start and end dates",
    });
  }

  // Check if date is already taken
  const existingItinerary = await prisma.itinerary.findFirst({
    where: { tripId, date },
  });

  if (existingItinerary) {
    return res
      .status(409)
      .json({ status: "error", message: "Date already taken" });
  }

  // Create the itinerary
  const itinerary = await prisma.itinerary.create({
    data: { tripId, date, day: calculateDay(date, trip.startDate) },
  });

  return res.status(201).json({ status: "success", data: { itinerary } });
};

const updateItinerary = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.tripId as string;
  const itineraryId = req.params.itineraryId as string;
  const date = new Date(req.body.date);

  // Check there's a userId and tripId and itineraryId
  if (!userId || !tripId || !itineraryId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ status: "error", message: "Invalid date" });
  }

  // Check if trip exists and belongs to the user
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip) {
    return res.status(404).json({ status: "error", message: "Trip not found" });
  }

  // Check the date falls within the trip so the day number can't be zero or negative
  if (date < trip.startDate || date > trip.endDate) {
    return res.status(400).json({
      status: "error",
      message: "Date must fall within the trip's start and end dates",
    });
  }

  // Check if itinerary exists and belongs to the trip
  const existingItinerary = await prisma.itinerary.findFirst({
    where: { id: itineraryId, tripId },
  });

  if (!existingItinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Check another day in this trip isn't already using the date
  const clashingItinerary = await prisma.itinerary.findFirst({
    where: { tripId, date, id: { not: itineraryId } },
  });

  if (clashingItinerary) {
    return res
      .status(409)
      .json({ status: "error", message: "Date already taken" });
  }

  // Update the itinerary. `day` is derived rather than trusted from the client
  // so it always agrees with the date.
  const itinerary = await prisma.itinerary.update({
    where: { id: itineraryId },
    data: { date, day: calculateDay(date, trip.startDate) },
  });

  return res.status(200).json({ status: "success", data: { itinerary } });
};

const deleteItinerary = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.tripId as string;
  const itineraryId = req.params.itineraryId as string;

  // Check there's a userId and tripId and itineraryId
  if (!userId || !tripId || !itineraryId) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  // Check if trip exists and belongs to the user
  const trip = await findOwnedTrip(tripId, userId);

  if (!trip) {
    return res.status(404).json({ status: "error", message: "Trip not found" });
  }

  // Check if itinerary exists and belongs to the trip
  const existingItinerary = await prisma.itinerary.findUnique({
    where: { id: itineraryId, tripId },
  });

  if (!existingItinerary) {
    return res
      .status(404)
      .json({ status: "error", message: "Itinerary not found" });
  }

  // Delete the itinerary
  const itinerary = await prisma.itinerary.delete({
    where: { id: itineraryId },
  });

  return res.status(200).json({ status: "success", data: { itinerary } });
};

export {
  getItineraries,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary,
};
