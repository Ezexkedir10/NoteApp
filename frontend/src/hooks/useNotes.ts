"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, getErrorMessage } from "@/services/api";
import { notesApi } from "@/services/notes.service";
import type { Note, NoteInput } from "@/types/note";

export type LoadStatus = "loading" | "ready" | "error";

/**
 * Owns the list of notes shown on the dashboard.
 * Every change goes to the backend first; local state is only updated after
 * the server confirms success. Mutations re-throw so the calling UI can show
 * the error where the user is looking (inside the editor or dialog).
 */
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setNotes(await notesApi.list());
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const createNote = useCallback(async (input: NoteInput): Promise<Note> => {
    const note = await notesApi.create(input);
    setNotes((current) => [note, ...current]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, input: NoteInput): Promise<Note> => {
    const updated = await notesApi.update(id, input);
    // The list is sorted by last edit, so an edited note moves to the front.
    setNotes((current) => [updated, ...current.filter((note) => note.id !== id)]);
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      await notesApi.remove(id);
    } catch (err) {
      // Already gone on the server (e.g. deleted in another tab): drop it locally too.
      if (err instanceof ApiError && err.status === 404) {
        setNotes((current) => current.filter((note) => note.id !== id));
      }
      throw err;
    }
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  return { notes, status, error, reload: loadNotes, createNote, updateNote, deleteNote };
}
