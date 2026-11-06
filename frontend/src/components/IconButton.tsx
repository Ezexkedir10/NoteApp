import { ReactNode } from "react";

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
}

/** Small icon-only button. `label` is required so screen readers know what it does. */
export function IconButton({ label, icon, onClick, tone = "default" }: IconButtonProps) {
  const toneClasses =
    tone === "danger"
      ? "hover:bg-danger-soft hover:text-danger"
      : "hover:bg-accent-soft hover:text-accent";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors ${toneClasses}`}
    >
      {icon}
    </button>
  );
}
