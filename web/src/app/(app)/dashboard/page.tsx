"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowNarrowRight,
  Calendar,
  Clock,
  Luggage01,
  MarkerPin01,
  Plus,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { formatDate, formatDateRange, formatWeekday } from "@/utils/formatDate";
import { formatTime } from "@/utils/formatTime";
import callApi from "@/utils/callApi";

interface DayWithActivities {
  itinerary: Itinerary;
  activities: Activity[];
}

// Midnight today in UTC, matching how date-only trip and itinerary values are
// stored, so comparisons don't drift with the local timezone.
const startOfTodayUtc = () => {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};

const DashboardPage = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<DayWithActivities[]>([]);
  const [hasTrips, setHasTrips] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const tripsData = await callApi("/api/trips", "GET", undefined);
        const trips: Trip[] = tripsData.data.trips;
        setHasTrips(trips.length > 0);

        // The soonest trip that hasn't finished yet is the one worth surfacing.
        const today = startOfTodayUtc();
        const upcoming = trips
          .filter((t) => new Date(t.endDate).getTime() >= today)
          .sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          )[0];

        if (!upcoming) {
          setTrip(null);
          setDays([]);
          setError(null);
          return;
        }

        setTrip(upcoming);

        const itinerariesData = await callApi(
          `/api/itineraries/${upcoming.id}`,
          "GET",
          undefined,
        );
        const itineraries: Itinerary[] = itinerariesData.data.itineraries;

        // Show the next few days that haven't passed yet.
        const nextDays = itineraries
          .filter((itinerary) => new Date(itinerary.date).getTime() >= today)
          .sort(
            (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          )
          .slice(0, 3);

        const withActivities = await Promise.all(
          nextDays.map(async (itinerary) => {
            const activitiesData = await callApi(
              `/api/activities/${itinerary.id}`,
              "GET",
              undefined,
            );
            return {
              itinerary,
              activities: activitiesData.data.activities as Activity[],
            };
          }),
        );

        setDays(withActivities);
        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-dvh bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <h1 className="text-display-xs font-semibold text-primary">
          Dashboard
        </h1>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg bg-error-primary px-4 py-3 ring-1 ring-error_subtle ring-inset"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-fg-error-secondary" />
            <p className="text-sm font-medium text-error-primary">
              {error.message}
            </p>
          </div>
        )}

        {!error && loading && (
          <div className="flex animate-pulse flex-col gap-6 rounded-2xl bg-primary p-6 ring-1 ring-secondary sm:p-8">
            <div className="h-8 w-2/3 rounded bg-tertiary" />
            <div className="h-4 w-1/3 rounded bg-tertiary" />
            <div className="h-24 rounded-xl bg-tertiary" />
          </div>
        )}

        {/* No trips at all */}
        {!error && !loading && !hasTrips && (
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-primary ring-4 ring-brand/20">
              <Luggage01 className="size-6 text-fg-brand-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">
                No trips yet
              </h2>
              <p className="text-sm text-tertiary">
                Plan your first trip to see it here.
              </p>
            </div>
            <Button href="/trips" iconLeading={Plus}>
              New trip
            </Button>
          </div>
        )}

        {/* Trips exist, but none upcoming */}
        {!error && !loading && hasTrips && !trip && (
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">
                No upcoming trips
              </h2>
              <p className="text-sm text-tertiary">
                All of your trips have wrapped up. Time to plan another one.
              </p>
            </div>
            <Button href="/trips" iconLeading={ArrowNarrowRight}>
              View trips
            </Button>
          </div>
        )}

        {/* Upcoming trip summary */}
        {!error && !loading && trip && (
          <div className="flex flex-col gap-6">
            <Link
              href={`/trips/${trip.id}`}
              className="group flex flex-col gap-4 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear hover:shadow-md hover:ring-brand sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="w-fit rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-brand-secondary ring-1 ring-brand ring-inset">
                    Next trip
                  </span>
                  <h2 className="text-lg font-semibold text-primary">
                    {trip.title}
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-tertiary">
                    <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                    {trip.destination}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-tertiary">
                    <Calendar className="size-4 shrink-0 text-fg-quaternary" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>
                <ArrowNarrowRight className="mt-1 size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" />
              </div>
            </Link>

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-primary">
                Upcoming days
              </h2>

              {days.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-12 text-center ring-1 ring-secondary">
                  <h3 className="text-md font-semibold text-primary">
                    No days planned yet
                  </h3>
                  <p className="text-sm text-tertiary">
                    Open the trip to start planning its itinerary.
                  </p>
                </div>
              )}

              {days.map(({ itinerary, activities }) => (
                <Link
                  key={itinerary.id}
                  href={`/trips/${trip.id}/${itinerary.id}`}
                  className="group flex flex-col gap-4 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear hover:shadow-md hover:ring-brand sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary ring-1 ring-brand ring-inset">
                      <span className="text-xs text-brand-secondary">Day</span>
                      <span className="text-sm font-semibold text-brand-secondary">
                        {itinerary.day}
                      </span>
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <h3 className="truncate text-md font-semibold text-primary">
                        {formatDate(itinerary.date)}
                      </h3>
                      <p className="truncate text-sm text-tertiary">
                        {formatWeekday(itinerary.date)} &middot;{" "}
                        {activities.length}{" "}
                        {activities.length === 1 ? "activity" : "activities"}
                      </p>
                    </div>

                    <ArrowNarrowRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" />
                  </div>

                  {activities.length > 0 && (
                    <ul className="flex flex-col gap-2 border-t border-secondary pt-4">
                      {activities.slice(0, 3).map((activity) => (
                        <li
                          key={activity.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-tertiary">
                            <Clock className="size-4 shrink-0 text-fg-quaternary" />
                            {formatTime(activity.startTime)}
                          </span>
                          <span className="truncate font-medium text-primary">
                            {activity.title}
                          </span>
                        </li>
                      ))}
                      {activities.length > 3 && (
                        <li className="text-sm text-tertiary">
                          + {activities.length - 3} more
                        </li>
                      )}
                    </ul>
                  )}
                </Link>
              ))}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
