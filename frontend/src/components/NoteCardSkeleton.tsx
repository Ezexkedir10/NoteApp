/** Placeholder cards shown while notes are loading. */
export function NoteGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading notes" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Loading notes...</span>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="animate-pulse overflow-hidden rounded-xl border border-line bg-surface"
        >
          <div className="h-1.5 bg-line" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-line" />
            <div className="h-3 w-full rounded bg-paper" />
            <div className="h-3 w-full rounded bg-paper" />
            <div className="h-3 w-4/5 rounded bg-paper" />
          </div>
          <div className="border-t border-line px-5 py-4">
            <div className="h-3 w-24 rounded bg-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}
