import { Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/Button";

/** Shown when the database has no notes yet. */
export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <StickyNote className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold tracking-tight">Your notebook is empty</h2>
      <p className="mt-2 text-ink-soft">
        Jot down an idea, a to-do list or meeting notes. Everything you save is stored in your database.
      </p>
      <Button className="mt-6" onClick={onCreate} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
        Create your first note
      </Button>
    </div>
  );
}
