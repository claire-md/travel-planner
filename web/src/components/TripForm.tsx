"use client";

import { useState } from "react";
import { AlertCircle, MarkerPin01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import validateForm from "@/utils/validateForm";
import callApi from "@/utils/callApi";

// The server generates the id, so the form only ever holds the editable fields.
type TripFormData = Omit<Trip, "id">;

const initialFormState: TripFormData = {
  title: "",
  destination: "",
  startDate: new Date(),
  endDate: new Date(),
};

const requiredFields = ["title", "destination", "startDate", "endDate"];

// A native date input only accepts a `yyyy-MM-dd` string, but the initial form
// state holds `Date` objects until the user picks a date.
const toDateInputValue = (value: Date | string) => {
  if (!(value instanceof Date)) {
    return value;
  }

  const localTime = value.getTime() - value.getTimezoneOffset() * 60_000;

  return new Date(localTime).toISOString().slice(0, 10);
};

interface TripFormProps {
  /** Called once a trip has been created or updated successfully. */
  onSuccess?: () => void;
  /** An existing trip to edit. When omitted the form creates a new trip. */
  trip?: Trip;
}

export const TripForm = ({ onSuccess, trip }: TripFormProps) => {
  const isEdit = Boolean(trip);

  const [formData, setFormData] = useState<TripFormData>(
    trip
      ? {
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
        }
      : initialFormState,
  );
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm(formData, requiredFields)) {
      setError(new Error("Invalid form data"));
      setLoading(false);
      return;
    }

    try {
      if (trip) {
        // The update endpoint also expects the id in the body, not just the URL.
        await callApi(`/api/trips/${trip.id}`, "PUT", { id: trip.id, ...formData });
      } else {
        await callApi("/api/trips", "POST", formData);
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
          <Label htmlFor="title">Trip name</Label>
          <InputBase
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destination">Destination</Label>
          <InputBase
            id="destination"
            name="destination"
            icon={MarkerPin01}
            value={formData.destination}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <InputBase
              id="startDate"
              name="startDate"
              type="date"
              value={toDateInputValue(formData.startDate)}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="endDate">End date</Label>
            <InputBase
              id="endDate"
              name="endDate"
              type="date"
              value={toDateInputValue(formData.endDate)}
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
        {isEdit ? "Save changes" : "Create trip"}
      </Button>
    </form>
  );
};
