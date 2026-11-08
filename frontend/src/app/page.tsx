"use client";

import { useMemo, useState } from "react";
import { RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { NoteGridSkeleton } from "@/components/NoteCardSkeleton";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/useToast";
import type { Note, NoteInput } from "@/types/note";

/** `null` = editor closed, `{}` = creating, `{ note }` = editing that note. */
type EditorState = { note?: Note } | null;

export default function DashboardPage() {
  const { notes, status, error, reload, createNote, updateNote, deleteNote } = useNotes();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const query = search.trim().toLowerCase();
  const visibleNotes = useMemo(() => {
    if (!query) return notes;
    return notes.filter(
      (note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query)
    );
  }, [notes, query]);

  async function handleSave(input: NoteInput) {
    if (editor?.note) {
      await updateNote(editor.note.id, input);
      showToast("success", "Note updated.");
    } else {
      await createNote(input);
      showToast("success", "Note created.");
    }
    setEditor(null);
  }

  async function handleDelete() {
    if (!noteToDelete) return;
    await deleteNote(noteToDelete.id);
    setNoteToDelete(null);
    showToast("success", "Note deleted.");
  }

  const countLabel =
    query && status === "ready"
      ? `Showing ${visibleNotes.length} of ${notes.length}`
      : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`;

  return (
    <>
      <Header searchValue={search} onSearchChange={setSearch} onNewNote={() => setEditor({})} />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7 flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Your notes</h1>
          {status === "ready" && (
            <p aria-live="polite" className="text-sm font-medium text-ink-soft">
              {countLabel}
            </p>
          )}
        </div>

        {status === "loading" && <NoteGridSkeleton />}

        {status === "error" && (
          <ErrorState title="Couldn't load your notes" message={error ?? "Something went wrong."}>
            <Button onClick={reload} icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
              Try again
            </Button>
          </ErrorState>
        )}

        {status === "ready" && notes.length === 0 && <EmptyState onCreate={() => setEditor({})} />}

        {status === "ready" && notes.length > 0 && visibleNotes.length === 0 && (
          <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center">
            <SearchX className="h-10 w-10 text-ink-faint" aria-hidden="true" />
            <h2 className="mt-4 font-display text-xl font-bold">No notes match your search</h2>
            <p className="mt-1.5 break-all text-ink-soft">Nothing found for &ldquo;{search.trim()}&rdquo;.</p>
            <Button variant="secondary" className="mt-5" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        )}

        {status === "ready" && visibleNotes.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(selected) => setEditor({ note: selected })}
                onDelete={setNoteToDelete}
              />
            ))}
          </div>
        )}
      </main>

      {editor && (
        <NoteEditor
          // `key` resets the form fields whenever a different note is opened.
          key={editor.note?.id ?? "new"}
          note={editor.note}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}

      {noteToDelete && (
        <ConfirmDialog
          title="Delete this note?"
          message={
            <>
              &ldquo;{noteToDelete.title}&rdquo; will be permanently removed. This can&apos;t be undone.
            </>
          }
          confirmLabel="Delete note"
          onConfirm={handleDelete}
          onClose={() => setNoteToDelete(null)}
        />
      )}
    </>
  );
}
