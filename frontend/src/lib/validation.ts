import type { NoteInput } from "@/types/note";

// Keep these limits in sync with backend/src/utils/validation.ts.
export const TITLE_MAX_LENGTH = 120;
export const CONTENT_MAX_LENGTH = 10000;

export type NoteFieldErrors = Partial<Record<keyof NoteInput, string>>;

/** Client-side validation. The backend validates again, so this is for fast feedback only. */
export function validateNoteInput(input: NoteInput): NoteFieldErrors {
  const errors: NoteFieldErrors = {};
  const title = input.title.trim();
  const content = input.content.trim();

  if (title === "") {
    errors.title = "Add a title for your note.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title under ${TITLE_MAX_LENGTH} characters.`;
  }

  if (content === "") {
    errors.content = "Write something in the note before saving.";
  } else if (content.length > CONTENT_MAX_LENGTH) {
    errors.content = `Keep the note under ${CONTENT_MAX_LENGTH.toLocaleString("en")} characters.`;
  }

  return errors;
}

export function hasErrors(errors: NoteFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
