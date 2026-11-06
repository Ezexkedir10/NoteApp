"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { getErrorMessage } from "@/services/api";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  /** Should perform the action. Throw to keep the dialog open and show the error. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation step for destructive actions (used before deleting a note). */
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSubmitting = useRef(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the safe option first so Enter never deletes by accident.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  async function handleConfirm() {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsWorking(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      isSubmitting.current = false;
      setIsWorking(false);
    }
  }

  return (
    <Modal labelId="confirm-dialog-title" onClose={onClose} isBusy={isWorking} size="sm">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="font-display text-lg font-bold tracking-tight">
              {title}
            </h2>
            <div className="mt-1.5 break-words text-sm leading-relaxed text-ink-soft">{message}</div>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={isWorking}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isWorking}>
            {isWorking ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
