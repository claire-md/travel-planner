"use client";

import { useState } from "react";
import { AlertCircle, MarkerPin01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import validateForm from "@/utils/validateForm";
import callApi from "@/utils/callApi";

// The server generates the id and reads the itinerary from the URL, so the form
// only holds the editable fields. Times stay `HH:MM` strings because that's what
// a native time input works with and what the API parses.
interface ActivityFormData {
  title: string;
  location: string;
  startTime: string;
  endTime: string;
}

const initialFormState: ActivityFormData = {
  title: "",
  location: "",
  startTime: "",
  endTime: "",
};

const requiredFields = ["title", "location", "startTime", "endTime"];

// `@db.Time` values arrive anchored to the Unix epoch in UTC. Read them back in
// UTC so a native time input shows the same `HH:MM` that was stored.
const toTimeInputValue = (value: Date | string) => {
  const time = new Date(value);

  if (Number.isNaN(time.getTime())) {
    return "";
  }

  const hours = String(time.getUTCHours()).padStart(2, "0");
  const minutes = String(time.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

interface ActivityFormProps {
  /** Itinerary the activity belongs to. */
  itineraryId: string;
  /** An existing activity to edit. When omitted the form creates a new one. */
  activity?: Activity;
  /** Called once an activity has been created or updated successfully. */
  onSuccess?: () => void;
}

export const ActivityForm = ({
  itineraryId,
  activity,
  onSuccess,
}: ActivityFormProps) => {
  const isEdit = Boolean(activity);

  const [formData, setFormData] = useState<ActivityFormData>(
    activity
      ? {
          title: activity.title,
          location: activity.location,
          startTime: toTimeInputValue(activity.startTime),
          endTime: toTimeInputValue(activity.endTime),
        }
      : initialFormState,
  );
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm(formData, requiredFields)) {
      setError(new Error("All fields are required"));
      setLoading(false);
      return;
    }

    // A time input always yields a zero-padded 24 hour value, so comparing the
    // strings compares the times.
    if (formData.endTime < formData.startTime) {
      setError(new Error("End time cannot be before start time"));
      setLoading(false);
      return;
    }

    try {
      if (activity) {
        await callApi(
          `/api/activities/${itineraryId}/${activity.id}`,
          "PUT",
          formData,
        );
      } else {
        await callApi(`/api/activities/${itineraryId}`, "POST", formData);
      }

      setError(null);
      setFormData(isEdit ? formData : initialFormState);
      onSuccess?.();
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Activity</Label>
          <InputBase
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <InputBase
            id="location"
            name="location"
            icon={MarkerPin01}
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="startTime">Start time</Label>
            <InputBase
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="endTime">End time</Label>
            <InputBase
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={loading}
        isDisabled={loading}
        className="w-full"
      >
        {isEdit ? "Save changes" : "Add activity"}
      </Button>
    </form>
  );
};
