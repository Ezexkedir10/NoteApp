"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileQuestion, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { NoteEditor } from "@/components/NoteEditor";
import { useNote } from "@/hooks/useNote";
import { useToast } from "@/hooks/useToast";
import { formatFullDate, wasEdited } from "@/lib/format";
import { getNoteAccentClass } from "@/lib/noteColor";
import type { NoteInput } from "@/types/note";

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { note, status, error, reload, updateNote, deleteNote } = useNote(params.id);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave(input: NoteInput) {
    await updateNote(input);
    setIsEditing(false);
    showToast("success", "Note updated.");
  }

  async function handleDelete() {
    await deleteNote();
    showToast("success", "Note deleted.");
    router.push("/");
  }

  const backLink = (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-ink-soft hover:text-accent"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      All notes
    </Link>
  );

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {backLink}

        {status === "loading" && (
          <div role="status" aria-label="Loading note" className="animate-pulse overflow-hidden rounded-2xl border border-line bg-surface">
            <span className="sr-only">Loading note...</span>
            <div className="h-1.5 bg-line" aria-hidden="true" />
            <div className="space-y-4 p-6 sm:p-8" aria-hidden="true">
              <div className="h-8 w-2/3 rounded bg-line" />
              <div className="h-3 w-40 rounded bg-paper" />
              <div className="space-y-3 pt-4">
                <div className="h-3 w-full rounded bg-paper" />
                <div className="h-3 w-full rounded bg-paper" />
                <div className="h-3 w-3/4 rounded bg-paper" />
              </div>
            </div>
          </div>
        )}

        {status === "not-found" && (
          <ErrorState
            title="Note not found"
            message={error ?? "This note doesn't exist. It may have been deleted."}
            icon={<FileQuestion className="h-7 w-7" aria-hidden="true" />}
          >
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Back to all notes
            </Link>
          </ErrorState>
        )}

        {status === "error" && (
          <ErrorState title="Couldn't load this note" message={error ?? "Something went wrong."}>
            <Button onClick={reload} icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
              Try again
            </Button>
          </ErrorState>
        )}

        {status === "ready" && note && (
          <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            <span aria-hidden="true" className={`block h-1.5 w-full ${getNoteAccentClass(note.id)}`} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h1 className="min-w-0 break-words font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {note.title}
                </h1>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(true)}
                    icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsDeleting(true)}
                    icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                    className="text-danger hover:bg-danger-soft"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-sm text-ink-faint">
                Created {formatFullDate(note.createdAt)}
                {wasEdited(note) && <> &middot; Edited {formatFullDate(note.updatedAt)}</>}
              </p>

              <div className="ruled-paper mt-6 whitespace-pre-wrap break-words text-base">{note.content}</div>
            </div>
          </article>
        )}
      </main>

      {isEditing && note && <NoteEditor note={note} onSave={handleSave} onClose={() => setIsEditing(false)} />}

      {isDeleting && note && (
        <ConfirmDialog
          title="Delete this note?"
          message={
            <>
              &ldquo;{note.title}&rdquo; will be permanently removed. This can&apos;t be undone.
            </>
          }
          confirmLabel="Delete note"
          onConfirm={handleDelete}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </>
  );
}
