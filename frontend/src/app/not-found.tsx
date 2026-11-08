import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";

export default function NotFoundPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Page not found"
          message="That page doesn't exist. Head back to your notes."
          icon={<FileQuestion className="h-7 w-7" aria-hidden="true" />}
        >
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Back to all notes
          </Link>
        </ErrorState>
      </main>
    </>
  );
}
