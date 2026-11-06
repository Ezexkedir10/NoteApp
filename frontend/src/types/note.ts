/** A note exactly as returned by the backend API. Dates are ISO-8601 strings. */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** The fields a user can edit. */
export interface NoteInput {
  title: string;
  content: string;
}
