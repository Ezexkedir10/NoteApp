import { AppError } from "./AppError";

export const TITLE_MAX_LENGTH = 120;
export const CONTENT_MAX_LENGTH = 10000;

export interface NoteInput {
  title: string;
  content: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the id if it is a well-formed UUID, otherwise throws a 400. */
export function parseNoteId(id: unknown): string {
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    throw new AppError(400, "Invalid note ID. It must be a valid UUID.");
  }
  return id;
}

/**
 * Validates and normalises a create/update request body.
 * Titles and content are trimmed, so whitespace-only values are rejected.
 */
export function parseNoteInput(body: unknown): NoteInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new AppError(400, "Request body must be a JSON object with a title and content.");
  }

  const { title, content } = body as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanContent = typeof content === "string" ? content.trim() : "";

  if (typeof title !== "string") {
    errors.title = "Title is required.";
  } else if (cleanTitle === "") {
    errors.title = "Title cannot be empty or only spaces.";
  } else if (cleanTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (typeof content !== "string") {
    errors.content = "Content is required.";
  } else if (cleanContent === "") {
    errors.content = "Content cannot be empty or only spaces.";
  } else if (cleanContent.length > CONTENT_MAX_LENGTH) {
    errors.content = `Content must be ${CONTENT_MAX_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(400, Object.values(errors).join(" "), errors);
  }

  return { title: cleanTitle, content: cleanContent };
}
