import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
  /** Buttons or links, e.g. a "Try again" button. */
  children?: ReactNode;
}

/** Full-width error panel for failed page loads. */
export function ErrorState({ title, message, icon, children }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-line bg-surface px-6 py-12 text-center shadow-card"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        {icon ?? <AlertTriangle className="h-7 w-7" aria-hidden="true" />}
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 break-words text-ink-soft">{message}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
