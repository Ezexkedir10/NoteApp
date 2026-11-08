"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";

/** Safety net: shown if something unexpected crashes while rendering a page. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState
          title="Something went wrong"
          message="An unexpected error stopped this page from loading. Try again, and if it keeps happening, reload the browser tab."
        >
          <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
            Try again
          </Button>
        </ErrorState>
      </main>
    </>
  );
}
