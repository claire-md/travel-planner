import { type Response } from "express";
import { type Request as JWTRequest } from "express-jwt";
import { prisma } from "../db/prisma.ts";

const getTrips = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;

  // Check if there's a userId
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Get all trips for the user
  const trips = await prisma.trip.findMany({
    where: { userId },
  });

  return res.status(200).json({ status: "success", data: { trips } });
};

const getTrip = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.id as string;

  // Check if there's a userId
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if there's a tripId
  if (!tripId) {
    return res.status(400).json({ message: "Trip ID is required" });
  }

  // Get the trip
  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });

  // Check if the trip exists
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  return res.status(200).json({ status: "success", data: { trip } });
};

const createTrip = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const { title, destination, startDate, endDate } = req.body;

  // Check if there's a userId
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if any of the fields are empty
  if (!title || !destination || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Create the trip
  const trip = await prisma.trip.create({
    data: { userId, title, destination, startDate, endDate },
  });

  return res.status(201).json({ status: "success", data: { trip } });
};

const updateTrip = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.id as string;
  const { id, title, destination, startDate, endDate } = req.body;

  // Check if there's a userId
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if there's a tripId
  if (!tripId) {
    return res.status(400).json({ message: "Trip ID is required" });
  }

  // Check for empty fields
  if (!id || !title || !destination || !startDate || !endDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the tripId matches the id
  if (tripId !== id) {
    return res.status(400).json({ message: "Trip ID does not match" });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });

  // Check if the trip exists
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  // Update the trip
  const updatedTrip = await prisma.trip.update({
    where: { id: tripId, userId },
    data: { title, destination, startDate, endDate },
  });

  return res
    .status(200)
    .json({ status: "success", data: { trip: updatedTrip } });
};

const deleteTrip = async (req: JWTRequest, res: Response) => {
  const userId = req.auth?.id;
  const tripId = req.params.id as string;

  // Check if there's a userId
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if there's a tripId
  if (!tripId) {
    return res.status(400).json({ message: "Trip ID is required" });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId, userId },
  });

  // Check if the trip exists
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  // Delete the trip
  await prisma.trip.delete({ where: { id: tripId, userId } });

  return res.status(200).json({ status: "success" });
};

export { getTrips, getTrip, createTrip, updateTrip, deleteTrip };
