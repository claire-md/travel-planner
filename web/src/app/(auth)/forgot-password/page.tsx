"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import callApi from "@/utils/callApi";
import validateForm from "@/utils/validateForm";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm({ email }, ["email"])) {
      setError(new Error("Please enter a valid email"));
      setLoading(false);
      return;
    }

    try {
      await callApi("/api/auth/forgot-password", "POST", { email });
      setError(null);
      setSubmitted(true);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col justify-center bg-secondary px-4 py-12">
      <div className="mx-auto flex w-full max-w-100 flex-col gap-8 rounded-2xl bg-primary px-6 py-10 shadow-lg ring-1 ring-secondary sm:px-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-display-xs font-semibold text-primary">
              Reset your password
            </h1>
            <p className="text-sm text-tertiary">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>
        </div>

        {submitted ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg bg-success-primary px-4 py-3 ring-1 ring-secondary ring-inset"
          >
            <CheckCircle className="mt-0.5 size-4 shrink-0 text-fg-success-secondary" />
            <p className="text-sm font-medium text-success-primary">
              If that account exists, a reset link has been sent.
            </p>
          </div>
        ) : (
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <InputBase
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              isDisabled={loading}
              className="w-full"
            >
              Send reset link
            </Button>
          </form>
        )}

        <p className="flex items-center justify-center gap-1 text-center text-sm text-tertiary">
          Remember your password?
          <Button color="link-color" size="sm" href="/login">
            Log in
          </Button>
        </p>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
