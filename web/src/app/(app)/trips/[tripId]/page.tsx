"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  MarkerPin01,
  Moon01,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { formatDate } from "@/utils/formatDate";
import callApi from "@/utils/callApi";

// Show a specific trip's details
const TripPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);

      try {
        const data = await callApi(
          `/api/trips/${tripId}`,
          "GET",
          undefined,
          "Failed to fetch trip",
        );
        setTrip(data.data.trip);
      } catch (error) {
        console.error(error);
        setError(new Error("Failed to fetch trip"));
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  const nights = trip
    ? Math.round(
        (new Date(trip.endDate).getTime() -
          new Date(trip.startDate).getTime()) /
          86_400_000,
      )
    : 0;

  return (
    <main className="min-h-dvh bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Button
          color="link-gray"
          size="sm"
          href="/trips"
          iconLeading={ArrowLeft}
        >
          Back to trips
        </Button>

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

        {!error && !loading && !trip && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
            <h1 className="text-lg font-semibold text-primary">
              Trip not found
            </h1>
            <p className="text-sm text-tertiary">
              This trip may have been deleted.
            </p>
          </div>
        )}

        {!error && trip && (
          <article className="flex flex-col gap-8 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
            <header className="flex flex-col gap-3">
              <h1 className="text-display-xs font-semibold text-primary">
                {trip.title}
              </h1>
              <p className="flex items-center gap-2 text-md text-tertiary">
                <MarkerPin01 className="size-5 shrink-0 text-fg-quaternary" />
                {trip.destination}
              </p>
            </header>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1 rounded-xl bg-secondary px-4 py-3 ring-1 ring-secondary">
                <dt className="flex items-center gap-2 text-sm text-tertiary">
                  <Calendar className="size-4 shrink-0 text-fg-quaternary" />
                  Start date
                </dt>
                <dd className="text-md font-medium text-primary">
                  {formatDate(trip.startDate)}
                </dd>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-secondary px-4 py-3 ring-1 ring-secondary">
                <dt className="flex items-center gap-2 text-sm text-tertiary">
                  <Calendar className="size-4 shrink-0 text-fg-quaternary" />
                  End date
                </dt>
                <dd className="text-md font-medium text-primary">
                  {formatDate(trip.endDate)}
                </dd>
              </div>

              <div className="flex flex-col gap-1 rounded-xl bg-secondary px-4 py-3 ring-1 ring-secondary">
                <dt className="flex items-center gap-2 text-sm text-tertiary">
                  <Moon01 className="size-4 shrink-0 text-fg-quaternary" />
                  Duration
                </dt>
                <dd className="text-md font-medium text-primary">
                  {Number.isFinite(nights)
                    ? `${nights} ${nights === 1 ? "night" : "nights"}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </main>
  );
};

export default TripPage;
