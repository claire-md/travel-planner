"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AlertCircle, Mail01, Trash01, User01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import callApi from "@/utils/callApi";
import validateForm from "@/utils/validateForm";

const requiredFields = ["firstName", "lastName", "email"];

// Show a user's account details and allow them to update or delete their account
const AccountPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      try {
        const data = await callApi("/api/user", "GET", undefined);

        setUser({
          firstName: data.data.user.firstName,
          lastName: data.data.user.lastName,
          email: data.data.user.email,
        });
        setError(null);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const startEditing = () => {
    if (!user) {
      return;
    }

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email ?? "",
    });
    setError(null);
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    if (!validateForm(formData, requiredFields)) {
      setError(new Error("Please provide a valid name and email"));
      setSaving(false);
      return;
    }

    try {
      const data = await callApi("/api/user", "PUT", formData);

      setUser({
        firstName: data.data.user.firstName,
        lastName: data.data.user.lastName,
        email: data.data.user.email,
      });
      setError(null);
      setIsEditing(false);
    } catch (error) {
      setError(error as Error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await callApi("/api/user", "DELETE", undefined);
    router.push("/signup");
  };

  return (
    <main className="min-h-dvh bg-secondary px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-display-xs font-semibold text-primary">Account</h1>

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

        {loading && (
          <div className="flex animate-pulse flex-col gap-4 rounded-2xl bg-primary p-6 ring-1 ring-secondary sm:p-8">
            <div className="h-5 w-1/3 rounded bg-tertiary" />
            <div className="h-5 w-1/2 rounded bg-tertiary" />
            <div className="h-5 w-2/3 rounded bg-tertiary" />
          </div>
        )}

        {!loading && user && !isEditing && (
          <section className="flex flex-col gap-6 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-primary">
                Profile details
              </h2>
              <Button color="secondary" size="sm" onPress={startEditing}>
                Edit
              </Button>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-sm text-tertiary">
                  <User01 className="size-4 shrink-0 text-fg-quaternary" />
                  Name
                </dt>
                <dd className="text-md font-medium text-primary">
                  {user.firstName} {user.lastName}
                </dd>
              </div>

              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-sm text-tertiary">
                  <Mail01 className="size-4 shrink-0 text-fg-quaternary" />
                  Email
                </dt>
                <dd className="text-md font-medium text-primary">
                  {user.email}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {!loading && user && isEditing && (
          <section className="flex flex-col gap-6 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-secondary sm:p-8">
            <h2 className="text-lg font-semibold text-primary">
              Edit profile
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <InputBase
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <InputBase
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <InputBase
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  color="secondary"
                  size="lg"
                  onPress={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  isDisabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  isLoading={saving}
                  isDisabled={saving}
                >
                  Save changes
                </Button>
              </div>
            </form>
          </section>
        )}

        {!loading && user && (
          <section className="flex flex-col gap-4 rounded-2xl bg-primary p-6 shadow-xs ring-1 ring-error_subtle sm:p-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-primary">
                Delete account
              </h2>
              <p className="text-sm text-tertiary">
                Permanently delete your account and all of your trips. This
                can&apos;t be undone.
              </p>
            </div>

            <Button
              color="primary-destructive"
              size="lg"
              iconLeading={Trash01}
              className="w-fit"
              onPress={() => setIsDeleteOpen(true)}
            >
              Delete account
            </Button>
          </section>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete account"
        description="Your account and all of your trips will be permanently deleted. This can't be undone."
        confirmLabel="Delete account"
        onConfirm={handleDelete}
      />
    </main>
  );
};

export default AccountPage;
