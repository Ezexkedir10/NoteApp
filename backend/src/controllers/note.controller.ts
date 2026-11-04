import { noteService } from "../services/note.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { parseNoteId, parseNoteInput } from "../utils/validation";

// Controllers only translate HTTP <-> service calls:
// validate input, call the service, send the response.

export const getAllNotes = asyncHandler(async (_req, res) => {
  const notes = await noteService.findAll();
  sendSuccess(res, 200, "Notes retrieved successfully", notes);
});

export const getNoteById = asyncHandler(async (req, res) => {
  const id = parseNoteId(req.params.id);
  const note = await noteService.findById(id);
  sendSuccess(res, 200, "Note retrieved successfully", note);
});

export const createNote = asyncHandler(async (req, res) => {
  const input = parseNoteInput(req.body);
  const note = await noteService.create(input);
  sendSuccess(res, 201, "Note created successfully", note);
});

export const updateNote = asyncHandler(async (req, res) => {
  const id = parseNoteId(req.params.id);
  const input = parseNoteInput(req.body);
  const note = await noteService.update(id, input);
  sendSuccess(res, 200, "Note updated successfully", note);
});

export const deleteNote = asyncHandler(async (req, res) => {
  const id = parseNoteId(req.params.id);
  await noteService.remove(id);
  sendSuccess(res, 200, "Note deleted successfully", { id });
});
