// Each note gets a stable accent colour on the top edge of its card,
// derived from its id so it never changes between visits.
// (Full class names are listed so Tailwind can detect them.)
const ACCENT_CLASSES = [
  "bg-[#4F5BD5]",
  "bg-[#1E9E8F]",
  "bg-[#D99A00]",
  "bg-[#D9487A]",
  "bg-[#2D8FD5]",
];

export function getNoteAccentClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i)) % ACCENT_CLASSES.length;
  }
  return ACCENT_CLASSES[hash];
}
