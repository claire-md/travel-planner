import { prisma } from "../db/prisma.ts";

/**
 * Looks up a trip only if it belongs to the given user. Returns null when the
 * trip is missing or owned by somebody else so callers answer both cases the
 * same way and never confirm that another user's trip exists.
 */
export const findOwnedTrip = (tripId: string, userId: string) =>
  prisma.trip.findFirst({
    where: { id: tripId, userId },
  });

/**
 * An itinerary has no `userId` of its own, so ownership has to be resolved
 * through its trip.
 */
export const findOwnedItinerary = (itineraryId: string, userId: string) =>
  prisma.itinerary.findFirst({
    where: { id: itineraryId, trip: { userId } },
  });
