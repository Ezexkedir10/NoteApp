import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { formatFullDate, formatRelativeTime, wasEdited } from "@/lib/format";
import { getNoteAccentClass } from "@/lib/noteColor";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const edited = wasEdited(note);
  const dateLabel = edited ? note.updatedAt : note.createdAt;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-shadow hover:shadow-lifted">
      <span aria-hidden="true" className={`h-1.5 w-full ${getNoteAccentClass(note.id)}`} />

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="line-clamp-2 break-words font-display text-lg font-semibold leading-snug">
          {/* The ::after overlay makes the whole card open the note, while the action buttons stay clickable. */}
          <Link href={`/notes/${note.id}`} className="rounded after:absolute after:inset-0 after:content-['']">
            {note.title}
          </Link>
        </h2>
        <p className="line-clamp-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink-soft">
          {note.content}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-2.5">
        <time dateTime={dateLabel} title={formatFullDate(dateLabel)} className="text-xs text-ink-faint">
          {edited ? "Edited" : "Created"} {formatRelativeTime(dateLabel)}
        </time>
        <div className="relative z-10 -mr-2 flex items-center">
          <IconButton
            label={`Edit note: ${note.title}`}
            icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onEdit(note)}
          />
          <IconButton
            label={`Delete note: ${note.title}`}
            tone="danger"
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            onClick={() => onDelete(note)}
          />
        </div>
      </div>
    </article>
  );
}
