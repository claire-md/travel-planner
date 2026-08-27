"use client";

import { useState } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { AlertCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Runs when the user confirms. The dialog closes once it resolves. */
  onConfirm: () => Promise<void> | void;
}

// A controlled confirmation modal for destructive actions. It owns the loading
// and error state around `onConfirm` so callers only supply the action itself.
export const ConfirmDialog = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay
      isDismissable={!loading}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
        }
        onOpenChange(open);
      }}
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-overlay/70 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
    >
      <Modal className="w-full max-w-md entering:animate-in entering:zoom-in-95 exiting:animate-out exiting:zoom-out-95">
        <Dialog
          role="alertdialog"
          className="flex flex-col gap-6 rounded-2xl bg-primary px-6 py-6 shadow-xl ring-1 ring-secondary outline-hidden sm:px-8"
        >
          {({ close }) => (
            <>
              <div className="flex flex-col gap-1">
                <Heading
                  slot="title"
                  className="text-lg font-semibold text-primary"
                >
                  {title}
                </Heading>
                {description && (
                  <p className="text-sm text-tertiary">{description}</p>
                )}
              </div>

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

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  color="secondary"
                  size="lg"
                  onPress={close}
                  isDisabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  color="primary-destructive"
                  size="lg"
                  onPress={handleConfirm}
                  isLoading={loading}
                  isDisabled={loading}
                >
                  {confirmLabel}
                </Button>
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};
