import type { Note } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { NoteInput } from "../utils/validation";

/**
 * Database access for notes. Controllers never talk to Prisma directly.
 *
 * Prisma's "record not found" error (P2025) thrown by update/delete is
 * translated into a 404 by the central error handler.
 */
export const noteService = {
  /** Most recently edited notes first. */
  findAll(): Promise<Note[]> {
    return prisma.note.findMany({ orderBy: { updatedAt: "desc" } });
  },

  async findById(id: string): Promise<Note> {
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note) {
      throw new AppError(404, "Note not found.");
    }
    return note;
  },

  create(input: NoteInput): Promise<Note> {
    return prisma.note.create({ data: input });
  },

  update(id: string, input: NoteInput): Promise<Note> {
    return prisma.note.update({ where: { id }, data: input });
  },

  async remove(id: string): Promise<void> {
    await prisma.note.delete({ where: { id } });
  },
};
