"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import {
  AlertCircle,
  ArrowLeft,
  ArrowNarrowRight,
  Calendar,
  Edit01,
  MarkerPin01,
  Moon01,
  Plus,
  Trash01,
  XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { formatDate, formatDateForUrl, formatWeekday } from "@/utils/formatDate";
import callApi from "@/utils/callApi";
import { TripForm } from "@/components/TripForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function getNights(startDate: Date | string, endDate: Date | string) {
  return Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000,
  );
}

// Show a specific trip's details
const TripPage = () => {
  const router = useRouter();
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlanDayOpen, setIsPlanDayOpen] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isDeleteTripOpen, setIsDeleteTripOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(
    null,
  );
  const [itineraryToEdit, setItineraryToEdit] = useState<Itinerary | null>(
    null,
  );
  const [editDate, setEditDate] = useState("");
  const [editDayLoading, setEditDayLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditDay = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!itineraryToEdit) {
      return;
    }

    setEditDayLoading(true);

    try {
      await callApi(
        `/api/itineraries/${tripId}/${itineraryToEdit.id}`,
        "PUT",
        { date: editDate },
      );
      setItineraryToEdit(null);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setError(error as Error);
    } finally {
      setEditDayLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    await callApi(`/api/trips/${tripId}`, "DELETE", undefined);
    router.push("/trips");
  };

  const handleDeleteItinerary = async () => {
    if (!itineraryToDelete) {
      return;
    }

    await callApi(
      `/api/itineraries/${tripId}/${itineraryToDelete.id}`,
      "DELETE",
      undefined,
    );
    setRefreshKey((key) => key + 1);
  };

  const handlePlanDay = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await callApi(
        `/api/itineraries/${tripId}/${planDate}`,
        "POST",
        undefined,
      );

      // The detail route is keyed by itinerary id, so navigate with the id from
      // the created record rather than the raw date.
      router.push(`/trips/${tripId}/${data.data.itinerary.id}`);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Get trip information
  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);

      try {
        const data = await callApi(`/api/trips/${tripId}`, "GET", undefined);
        setTrip(data.data.trip);
        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId, refreshKey]);

  // Get all itineraries for this trip
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const data = await callApi(
          `/api/itineraries/${tripId}`,
          "GET",
          undefined,
        );

        setItineraries(data.data.itineraries);
      } catch (error) {
        setError(error as Error);
      }
    };
    fetchItineraries();
  }, [tripId, refreshKey]);

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

        {/* Error */}
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

        {/* Loading */}
        {!error && loading && (
          <div className="flex animate-pulse flex-col gap-6 rounded-2xl bg-primary p-6 ring-1 ring-secondary sm:p-8">
            <div className="h-8 w-2/3 rounded bg-tertiary" />
            <div className="h-4 w-1/3 rounded bg-tertiary" />
            <div className="h-24 rounded-xl bg-tertiary" />
          </div>
        )}

        {/* Trip not found */}
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

        {/* Trip found */}
        {!error && trip && (
          <>
            <article className="flex flex-col gap-8 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <header className="flex flex-col gap-3">
                  <h1 className="text-display-xs font-semibold text-primary">
                    {trip.title}
                  </h1>
                  <p className="flex items-center gap-2 text-md text-tertiary">
                    <MarkerPin01 className="size-5 shrink-0 text-fg-quaternary" />
                    {trip.destination}
                  </p>
                </header>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    iconLeading={Edit01}
                    onPress={() => setIsEditTripOpen(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    color="secondary-destructive"
                    size="sm"
                    aria-label="Delete trip"
                    iconLeading={Trash01}
                    onPress={() => setIsDeleteTripOpen(true)}
                  />
                </div>
              </div>
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
                    {getNights(trip.startDate, trip.endDate) === 1
                      ? "1 night"
                      : `${getNights(trip.startDate, trip.endDate)} nights`}
                  </dd>
                </div>
              </dl>
            </article>

            {/* Itinerary */}
            <section className="flex flex-col gap-4">
              <header className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-primary">
                  Planned days
                </h2>

                <Button
                  color="secondary"
                  size="sm"
                  iconLeading={Plus}
                  onClick={() => setIsPlanDayOpen(true)}
                >
                  Plan a day
                </Button>
              </header>

              {/* No itineraries found */}
              {itineraries.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-16 text-center ring-1 ring-secondary">
                  <h3 className="text-lg font-semibold text-primary">
                    No days planned yet
                  </h3>
                  <p className="text-sm text-tertiary">
                    Plan a day to start building this trip&apos;s itinerary.
                  </p>
                </div>
              )}

              {/* Itineraries found */}
              {itineraries.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {itineraries.map((itinerary) => (
                    <li
                      key={itinerary.id}
                      className="group relative flex items-center gap-4 rounded-2xl bg-primary p-4 shadow-xs ring-1 ring-secondary transition duration-100 ease-linear hover:shadow-md hover:ring-brand sm:p-5"
                    >
                      {/* Stretched link so the whole card navigates while the
                          delete button stays independently clickable. */}
                      <Link
                        href={`/trips/${tripId}/${itinerary.id}`}
                        aria-label={`View ${formatDate(itinerary.date)}`}
                        className="absolute inset-0 rounded-2xl"
                      />

                      <span className="relative flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary ring-1 ring-brand ring-inset">
                        <span className="text-xs text-brand-secondary">Day</span>
                        <span className="text-sm font-semibold text-brand-secondary">
                          {itinerary.day}
                        </span>
                      </span>

                      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                        <h3 className="truncate text-md font-semibold text-primary">
                          {formatDate(itinerary.date)}
                        </h3>
                        <p className="truncate text-sm text-tertiary">
                          {formatWeekday(itinerary.date)}
                        </p>
                      </div>

                      <Button
                        color="tertiary"
                        size="sm"
                        aria-label="Edit day"
                        iconLeading={Edit01}
                        onPress={() => {
                          setItineraryToEdit(itinerary);
                          setEditDate(formatDateForUrl(itinerary.date));
                        }}
                        className="relative z-10 shrink-0"
                      />

                      <Button
                        color="tertiary-destructive"
                        size="sm"
                        aria-label="Delete day"
                        iconLeading={Trash01}
                        onPress={() => setItineraryToDelete(itinerary)}
                        className="relative z-10 shrink-0"
                      />

                      <ArrowNarrowRight className="relative size-5 shrink-0 text-fg-quaternary transition duration-100 ease-linear group-hover:translate-x-0.5 group-hover:text-fg-brand-primary" />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Plan a day modal */}
            <ModalOverlay
              isDismissable
              isOpen={isPlanDayOpen}
              onOpenChange={(isOpen) => {
                setIsPlanDayOpen(isOpen);

                if (!isOpen) {
                  setPlanDate("");
                }
              }}
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
                            Plan a day
                          </Heading>
                          <p className="text-sm text-tertiary">
                            Pick a date between {formatDate(trip.startDate)} and{" "}
                            {formatDate(trip.endDate)}.
                          </p>
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

                      <form
                        onSubmit={handlePlanDay}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="date">Date</Label>
                          <InputBase
                            id="date"
                            name="date"
                            type="date"
                            isRequired
                            min={formatDateForUrl(trip.startDate)}
                            max={formatDateForUrl(trip.endDate)}
                            value={planDate}
                            onChange={(e) => setPlanDate(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                          <Button color="secondary" size="lg" onClick={close}>
                            Cancel
                          </Button>
                          <Button type="submit" size="lg">
                            Plan day
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>

            {/* Edit trip modal */}
            <ModalOverlay
              isDismissable
              isOpen={isEditTripOpen}
              onOpenChange={setIsEditTripOpen}
              className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-overlay/70 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
            >
              <Modal className="w-full max-w-lg entering:animate-in entering:zoom-in-95 exiting:animate-out exiting:zoom-out-95">
                <Dialog className="flex max-h-[85dvh] flex-col gap-6 overflow-y-auto rounded-2xl bg-primary px-6 py-6 shadow-xl ring-1 ring-secondary outline-hidden sm:px-8">
                  {({ close }) => (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <Heading
                          slot="title"
                          className="text-lg font-semibold text-primary"
                        >
                          Edit trip
                        </Heading>

                        <Button
                          color="tertiary"
                          size="sm"
                          aria-label="Close"
                          iconLeading={XClose}
                          onPress={close}
                          className="-mt-1 -mr-2"
                        />
                      </div>

                      <TripForm
                        trip={trip}
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

            {/* Delete trip confirmation */}
            <ConfirmDialog
              isOpen={isDeleteTripOpen}
              onOpenChange={setIsDeleteTripOpen}
              title="Delete trip"
              description={`"${trip.title}" and all its planned days will be permanently deleted.`}
              confirmLabel="Delete trip"
              onConfirm={handleDeleteTrip}
            />

            {/* Delete day confirmation */}
            <ConfirmDialog
              isOpen={itineraryToDelete !== null}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setItineraryToDelete(null);
                }
              }}
              title="Delete day"
              description={
                itineraryToDelete
                  ? `${formatDate(itineraryToDelete.date)} and its activities will be permanently deleted.`
                  : undefined
              }
              confirmLabel="Delete day"
              onConfirm={handleDeleteItinerary}
            />

            {/* Edit day modal */}
            <ModalOverlay
              isDismissable
              isOpen={itineraryToEdit !== null}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setItineraryToEdit(null);
                }
              }}
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
                            Change date
                          </Heading>
                          <p className="text-sm text-tertiary">
                            Pick a date between {formatDate(trip.startDate)} and{" "}
                            {formatDate(trip.endDate)}.
                          </p>
                        </div>

                        <Button
                          color="tertiary"
                          size="sm"
                          aria-label="Close"
                          iconLeading={XClose}
                          onPress={close}
                          className="-mt-1 -mr-2"
                        />
                      </div>

                      <form
                        onSubmit={handleEditDay}
                        className="flex flex-col gap-6"
                      >
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="editDate">Date</Label>
                          <InputBase
                            id="editDate"
                            name="editDate"
                            type="date"
                            isRequired
                            min={formatDateForUrl(trip.startDate)}
                            max={formatDateForUrl(trip.endDate)}
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                          <Button color="secondary" size="lg" onPress={close}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            isLoading={editDayLoading}
                            isDisabled={editDayLoading}
                          >
                            Save changes
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </Dialog>
              </Modal>
            </ModalOverlay>
          </>
        )}
      </div>
    </main>
  );
};

export default TripPage;
