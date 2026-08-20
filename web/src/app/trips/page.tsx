"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import {
  AlertCircle,
  ArrowNarrowRight,
  Calendar,
  Luggage01,
  MarkerPin01,
  Plus,
  XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { formatDateRange } from "@/utils/formatDate";
import callApi from "@/utils/callApi";
import { TripForm } from "@/components/TripForm";

// Shows a user all their trips
const TripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);

      try {
        const data = await callApi(
          "/api/trips",
          "GET",
          undefined,
          "Failed to fetch trips",
        );
        setTrips(data.data.trips);
        setError(null);
      } catch (error) {
        console.error(error);
        setError(new Error("Failed to fetch trips"));
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [refreshKey]);

  return (
    <main className="min-h-dvh bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-display-xs font-semibold text-primary">
              Your trips
            </h1>
          </div>

          <Button
            size="lg"
            iconLeading={Plus}
            onClick={() => setIsFormOpen(true)}
          >
            New trip
          </Button>
        </header>

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
          <ul className="flex flex-col gap-3">
            {[0, 1, 2].map((placeholder) => (
              <li
                key={placeholder}
                className="flex animate-pulse items-center gap-6 rounded-2xl bg-primary p-5 ring-1 ring-secondary"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-5 w-1/3 rounded bg-tertiary" />
                  <div className="h-4 w-1/4 rounded bg-tertiary" />
                </div>
                <div className="hidden h-4 w-48 shrink-0 rounded bg-tertiary sm:block" />
              </li>
            ))}
          </ul>
        )}

        {!error && !loading && trips.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-primary ring-4 ring-brand/20">
              <Luggage01 className="size-6 text-fg-brand-primary" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">
                No trips yet
              </h2>
            </div>

            <Button iconLeading={Plus} onClick={() => setIsFormOpen(true)}>
              New trip
            </Button>
          </div>
        )}

        {!error && !loading && trips.length > 0 && (
          <ul className="flex flex-col gap-3">
            {trips.map((trip, index) => {
              const { id } = trip as Trip & { id?: string };

              return (
                <li key={id ?? index}>
                  <Link
                    href={`/trips/${id}`}
                    className="group flex flex-col gap-3 rounded-2xl bg-primary p-5 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear hover:shadow-md hover:ring-brand sm:flex-row sm:items-center sm:gap-6"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h2 className="truncate text-lg font-semibold text-primary">
                        {trip.title}
                      </h2>
                      <p className="flex items-center gap-2 text-sm text-tertiary">
                        <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                        <span className="truncate">{trip.destination}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="flex items-center gap-2 text-sm whitespace-nowrap text-tertiary">
                        <Calendar className="size-4 shrink-0 text-fg-quaternary" />
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </p>
                      <ArrowNarrowRight className="size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* New trip modal */}
      <ModalOverlay
        isDismissable
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-overlay/70 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
      >
        <Modal className="w-full max-w-lg entering:animate-in entering:zoom-in-95 exiting:animate-out exiting:zoom-out-95">
          <Dialog className="flex max-h-[85dvh] flex-col gap-6 overflow-y-auto rounded-2xl bg-primary px-6 py-6 shadow-xl ring-1 ring-secondary outline-hidden sm:px-8">
            {({ close }) => (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <Heading
                      slot="title"
                      className="text-lg font-semibold text-primary"
                    >
                      New trip
                    </Heading>
                  </div>

                  <Button
                    color="tertiary"
                    size="sm"
                    aria-label="Close"
                    iconLeading={XClose}
                    onClick={close}
                    className="-mt-1 -mr-2"
                  />
                </div>

                <TripForm
                  onSuccess={() => {
                    close();
                    setRefreshKey((key) => key + 1);
                  }}
                />
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </main>
  );
};

export default TripsPage;
