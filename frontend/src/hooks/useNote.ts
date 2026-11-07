"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, getErrorMessage } from "@/services/api";
import { notesApi } from "@/services/notes.service";
import type { Note, NoteInput } from "@/types/note";

export type SingleNoteStatus = "loading" | "ready" | "not-found" | "error";

/** Loads and manages one note for the detail page (GET /notes/:id). */
export function useNote(id: string) {
  const [note, setNote] = useState<Note | null>(null);
  const [status, setStatus] = useState<SingleNoteStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const loadNote = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      setNote(await notesApi.get(id));
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err));
      // 400 = malformed id, 404 = no such note. Both mean "this note doesn't exist".
      const missing = err instanceof ApiError && (err.status === 404 || err.status === 400);
      setStatus(missing ? "not-found" : "error");
    }
  }, [id]);

  useEffect(() => {
    void loadNote();
  }, [loadNote]);

  const updateNote = useCallback(
    async (input: NoteInput): Promise<Note> => {
      const updated = await notesApi.update(id, input);
      setNote(updated);
      return updated;
    },
    [id]
  );

  const deleteNote = useCallback(async (): Promise<void> => {
    await notesApi.remove(id);
  }, [id]);

  return { note, status, error, reload: loadNote, updateNote, deleteNote };
}
