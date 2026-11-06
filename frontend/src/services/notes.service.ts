import type { Note, NoteInput } from "@/types/note";
import { apiRequest } from "./api";

/** One function per backend endpoint. Components never call fetch directly. */
export const notesApi = {
  list: () => apiRequest<Note[]>("/notes"),

  get: (id: string) => apiRequest<Note>(`/notes/${encodeURIComponent(id)}`),

  create: (input: NoteInput) => apiRequest<Note>("/notes", { method: "POST", body: input }),

  update: (id: string, input: NoteInput) =>
    apiRequest<Note>(`/notes/${encodeURIComponent(id)}`, { method: "PUT", body: input }),

  remove: (id: string) => apiRequest<{ id: string }>(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
