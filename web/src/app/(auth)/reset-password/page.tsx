"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import callApi from "@/utils/callApi";
import validateForm from "@/utils/validateForm";

const initialFormState = {
  password: "",
  confirmPassword: "",
};

const requiredFields = ["password", "confirmPassword"];

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      setError(new Error("This reset link is invalid or has expired"));
      setLoading(false);
      return;
    }

    if (!validateForm(formData, requiredFields)) {
      setError(
        new Error(
          "Passwords must match and be at least 8 characters",
        ),
      );
      setLoading(false);
      return;
    }

    try {
      await callApi("/api/auth/reset-password", "POST", {
        token,
        password: formData.password,
      });
      setError(null);
      router.push("/login");
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
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
          <Label htmlFor="password">New password</Label>
          <InputBase
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <InputBase
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        isLoading={loading}
        isDisabled={loading}
        className="w-full"
      >
        Reset password
      </Button>
    </form>
  );
};

const ResetPasswordPage = () => {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-secondary px-4 py-12">
      <div className="mx-auto flex w-full max-w-100 flex-col gap-8 rounded-2xl bg-primary px-6 py-10 shadow-lg ring-1 ring-secondary sm:px-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-display-xs font-semibold text-primary">
              Choose a new password
            </h1>
            <p className="text-sm text-tertiary">
              Enter a new password for your account.
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <p className="flex items-center justify-center gap-1 text-center text-sm text-tertiary">
          Back to
          <Button color="link-color" size="sm" href="/login">
            Log in
          </Button>
        </p>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
