"use client";

import { ReactNode, useEffect, useRef } from "react";

interface ModalProps {
  /** id of the element that titles the dialog (for screen readers). */
  labelId: string;
  onClose: () => void;
  /** While true (a request is running) the dialog cannot be dismissed with Esc. */
  isBusy?: boolean;
  size?: "sm" | "md";
  children: ReactNode;
}

/**
 * Thin wrapper around the native <dialog> element, which gives us a focus trap,
 * Esc-to-close and an inert page behind it for free.
 * Mount it only while it should be visible.
 */
export function Modal({ labelId, onClose, isBusy = false, size = "md", children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    // Stop the page behind the dialog from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelId}
      onCancel={(event) => {
        // Take over Esc handling so state stays in sync and busy dialogs stay open.
        event.preventDefault();
        if (!isBusy) onClose();
      }}
      onClose={onClose}
      className={`m-auto w-[calc(100%-2rem)] ${
        size === "sm" ? "max-w-md" : "max-w-2xl"
      } rounded-2xl border border-line bg-surface p-0 text-ink shadow-lifted backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]`}
    >
      {children}
    </dialog>
  );
}
