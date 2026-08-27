"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { formatDate } from "@/utils/formatDate";
import { formatTime } from "@/utils/formatTime";
import callApi from "@/utils/callApi";
import {
  AlertCircle,
  ArrowLeft,
  ArrowNarrowLeft,
  ArrowNarrowRight,
  Clock,
  Edit01,
  MarkerPin01,
  Plus,
  Trash01,
  XClose,
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ActivityForm } from "@/components/ActivityForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Show a single day of a trip and the activities planned for it
const ItineraryPage = () => {
  const { tripId, itineraryId } = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [siblings, setSiblings] = useState<Itinerary[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDeleteActivity = async () => {
    if (!activityToDelete) {
      return;
    }

    await callApi(
      `/api/activities/${itineraryId}/${activityToDelete.id}`,
      "DELETE",
      undefined,
    );
    setRefreshKey((key) => key + 1);
  };

  // Get itinerary info
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const data = await callApi(
          `/api/itineraries/${tripId}/${itineraryId}`,
          "GET",
          undefined,
        );

        setItinerary(data.data.itinerary);
        setError(null);
      } catch (error) {
        setError(error as Error);
      }
    };
    fetchItinerary();
  }, [itineraryId, tripId]);

  // Get activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await callApi(
          `/api/activities/${itineraryId}`,
          "GET",
          undefined,
        );
        setActivities(data.data.activities);
        setError(null);
      } catch (error) {
        setError(error as Error);
      }
    };
    fetchActivities();
  }, [itineraryId, refreshKey]);

  // Get the trip (for its destination) and the sibling days (for navigation)
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const [tripData, itinerariesData] = await Promise.all([
          callApi(`/api/trips/${tripId}`, "GET", undefined),
          callApi(`/api/itineraries/${tripId}`, "GET", undefined),
        ]);

        setTrip(tripData.data.trip);
        setSiblings(itinerariesData.data.itineraries);
      } catch (error) {
        setError(error as Error);
      }
    };
    fetchContext();
  }, [tripId]);

  // Days sorted by date so the previous/next links point at real neighbours.
  const orderedSiblings = [...siblings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const currentIndex = orderedSiblings.findIndex(
    (sibling) => sibling.id === itineraryId,
  );
  const previousDay =
    currentIndex > 0 ? orderedSiblings[currentIndex - 1] : null;
  const nextDay =
    currentIndex !== -1 && currentIndex < orderedSiblings.length - 1
      ? orderedSiblings[currentIndex + 1]
      : null;

  return (
    <main className="min-h-dvh bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Button
          color="link-gray"
          size="sm"
          href={`/trips/${tripId}`}
          iconLeading={ArrowLeft}
        >
          Back to trip
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

        {/* Day header */}
        <article className="flex flex-col gap-6 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <header className="flex flex-col gap-3">
              <span className="w-fit rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-brand-secondary ring-1 ring-brand ring-inset">
                Day {itinerary?.day}
              </span>

              <h1 className="text-display-xs font-semibold text-primary">
                {itinerary ? formatDate(itinerary.date) : ""}
              </h1>

              <p className="flex items-center gap-2 text-sm text-tertiary">
                <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                {trip?.destination}
              </p>
            </header>

            <Button
              iconLeading={Plus}
              className="sm:shrink-0"
              onPress={() => setIsAddActivityOpen(true)}
            >
              Add activity
            </Button>
          </div>
        </article>

        {/* Activities */}
        <section className="flex flex-col gap-5 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
          <header className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-primary">Activities</h2>
            <p className="text-sm whitespace-nowrap text-tertiary">
              {activities.length} planned
            </p>
          </header>

          {activities.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl bg-secondary px-6 py-10 text-center ring-1 ring-secondary">
              <h3 className="text-md font-semibold text-primary">
                No activities yet
              </h3>
              <p className="text-sm text-tertiary">
                Add an activity to start planning this day.
              </p>
            </div>
          )}

          <ol className="flex flex-col">
            {activities.map((activity) => (
              <li key={activity.id} className="group flex gap-4">
                {/* Time */}
                <div className="flex w-18 shrink-0 flex-col gap-0.5 pb-6 group-last:pb-0 sm:w-20">
                  <span className="text-sm font-semibold whitespace-nowrap text-primary">
                    {formatTime(activity.startTime)}
                  </span>
                  <span className="text-xs whitespace-nowrap text-quaternary">
                    {formatTime(activity.endTime)}
                  </span>
                </div>

                {/* Timeline rail */}
                <div
                  aria-hidden="true"
                  className="flex shrink-0 flex-col items-center"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                    <span className="size-2 rounded-full bg-brand-solid" />
                  </span>
                  <span className="w-px flex-1 bg-tertiary group-last:hidden" />
                </div>

                {/* Details */}
                <div className="flex min-w-0 flex-1 flex-col gap-1 pb-6 group-last:pb-0">
                  <h3 className="text-md font-medium text-primary">
                    {activity.title}
                  </h3>
                  <p className="flex items-center gap-2 text-sm text-tertiary">
                    <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" />
                    <span className="truncate">{activity.location}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-tertiary sm:hidden">
                    <Clock className="size-4 shrink-0 text-fg-quaternary" />
                    {formatTime(activity.startTime)} –{" "}
                    {formatTime(activity.endTime)}
                  </p>
                </div>

                <div className="-mt-1 flex shrink-0 items-center gap-1">
                  <Button
                    color="tertiary"
                    size="sm"
                    aria-label="Edit activity"
                    iconLeading={Edit01}
                    onPress={() => setActivityToEdit(activity)}
                  />
                  <Button
                    color="tertiary-destructive"
                    size="sm"
                    aria-label="Delete activity"
                    iconLeading={Trash01}
                    onPress={() => setActivityToDelete(activity)}
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Day navigation */}
        <nav className="flex items-center justify-between gap-3">
          {previousDay ? (
            <Button
              color="secondary"
              size="sm"
              href={`/trips/${tripId}/${previousDay.id}`}
              iconLeading={ArrowNarrowLeft}
            >
              Previous day
            </Button>
          ) : (
            <Button
              color="secondary"
              size="sm"
              isDisabled
              iconLeading={ArrowNarrowLeft}
            >
              Previous day
            </Button>
          )}

          {nextDay ? (
            <Button
              color="secondary"
              size="sm"
              href={`/trips/${tripId}/${nextDay.id}`}
              iconTrailing={ArrowNarrowRight}
            >
              Next day
            </Button>
          ) : (
            <Button
              color="secondary"
              size="sm"
              isDisabled
              iconTrailing={ArrowNarrowRight}
            >
              Next day
            </Button>
          )}
        </nav>

        {/* Add activity modal */}
        <ModalOverlay
          isDismissable
          isOpen={isAddActivityOpen}
          onOpenChange={setIsAddActivityOpen}
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
                        Add activity
                      </Heading>
                      <p className="text-sm text-tertiary">
                        Day {itinerary?.day} &middot;{" "}
                        {formatDate(itinerary?.date ?? "")}
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

                  <ActivityForm
                    itineraryId={itineraryId as string}
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

        {/* Edit activity modal */}
        <ModalOverlay
          isDismissable
          isOpen={activityToEdit !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setActivityToEdit(null);
            }
          }}
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
                      Edit activity
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

                  {activityToEdit && (
                    <ActivityForm
                      key={activityToEdit.id}
                      itineraryId={itineraryId as string}
                      activity={activityToEdit}
                      onSuccess={() => {
                        close();
                        setRefreshKey((key) => key + 1);
                      }}
                    />
                  )}
                </>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>

        {/* Delete activity confirmation */}
        <ConfirmDialog
          isOpen={activityToDelete !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setActivityToDelete(null);
            }
          }}
          title="Delete activity"
          description={
            activityToDelete
              ? `"${activityToDelete.title}" will be permanently deleted.`
              : undefined
          }
          confirmLabel="Delete activity"
          onConfirm={handleDeleteActivity}
        />
      </div>
    </main>
  );
};

export default ItineraryPage;
