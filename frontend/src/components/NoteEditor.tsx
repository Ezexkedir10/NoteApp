"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import {
  CONTENT_MAX_LENGTH,
  NoteFieldErrors,
  TITLE_MAX_LENGTH,
  hasErrors,
  validateNoteInput,
} from "@/lib/validation";
import { ApiError, getErrorMessage } from "@/services/api";
import type { Note, NoteInput } from "@/types/note";

interface NoteEditorProps {
  /** Pass a note to edit it; omit to create a new one. */
  note?: Note;
  /** Should send the request. Throw (ApiError) to keep the editor open and show the message. */
  onSave: (input: NoteInput) => Promise<void>;
  onClose: () => void;
}

export function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const isEditing = note !== undefined;

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [errors, setErrors] = useState<NoteFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // A ref is updated instantly, unlike state, so a fast double-click cannot send two requests.
  const isSubmitting = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting.current) return;

    const validationErrors = validateNoteInput({ title, content });
    setErrors(validationErrors);
    setSubmitError(null);
    if (hasErrors(validationErrors)) {
      (validationErrors.title ? titleRef : contentRef).current?.focus();
      return;
    }

    isSubmitting.current = true;
    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), content: content.trim() });
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors({ title: error.fieldErrors.title, content: error.fieldErrors.content });
      }
      setSubmitError(getErrorMessage(error));
    } finally {
      isSubmitting.current = false;
      setIsSaving(false);
    }
  }

  const fieldBorder = (hasError: boolean) =>
    hasError ? "border-danger" : "border-line-strong focus-within:border-accent";

  return (
    <Modal labelId="note-editor-title" onClose={onClose} isBusy={isSaving}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 id="note-editor-title" className="font-display text-xl font-bold tracking-tight">
            {isEditing ? "Edit note" : "New note"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close editor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-paper disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6">
          {submitError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="note-title" className="text-sm font-semibold">
                Title
              </label>
              <span className="text-xs text-ink-faint">
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              ref={titleRef}
              id="note-title"
              type="text"
              value={title}
              maxLength={TITLE_MAX_LENGTH}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your note a title"
              disabled={isSaving}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "note-title-error" : undefined}
              className={`w-full rounded-lg border bg-surface px-3.5 py-2.5 font-display text-xl font-semibold placeholder:font-normal placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:bg-paper ${
                errors.title ? "border-danger" : "border-line-strong focus:border-accent"
              }`}
            />
            {errors.title && (
              <p id="note-title-error" className="mt-1.5 text-sm text-danger">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label htmlFor="note-content" className="text-sm font-semibold">
                Note
              </label>
              <span className="text-xs text-ink-faint">
                {content.length.toLocaleString("en")}/{CONTENT_MAX_LENGTH.toLocaleString("en")}
              </span>
            </div>
            <div
              className={`rounded-lg border bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-accent/20 ${fieldBorder(
                Boolean(errors.content)
              )}`}
            >
              <textarea
                ref={contentRef}
                id="note-content"
                value={content}
                maxLength={CONTENT_MAX_LENGTH}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing..."
                disabled={isSaving}
                aria-invalid={Boolean(errors.content)}
                aria-describedby={errors.content ? "note-content-error" : undefined}
                className="ruled-paper block h-64 w-full resize-none bg-transparent text-base placeholder:text-ink-faint focus:outline-none disabled:opacity-70 sm:h-72"
              />
            </div>
            {errors.content && (
              <p id="note-content-error" className="mt-1.5 text-sm text-danger">
                {errors.content}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            icon={<Save className="h-4 w-4" aria-hidden="true" />}
          >
            {isSaving ? "Saving..." : isEditing ? "Save changes" : "Save note"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
