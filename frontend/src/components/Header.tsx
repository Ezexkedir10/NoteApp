"use client";

import Link from "next/link";
import { Plus, Search, StickyNote } from "lucide-react";
import { Button } from "@/components/Button";

interface HeaderProps {
  /** Provide both search props to show the search box. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Provide to show the "New note" button. */
  onNewNote?: () => void;
}

export function Header({ searchValue = "", onSearchChange, onNewNote }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent text-white">
            <StickyNote className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">Veloria</span>
        </Link>

        {onSearchChange && (
          <div className="relative order-last w-full sm:order-2 sm:ml-4 sm:w-auto sm:max-w-md sm:flex-1">
            <label htmlFor="note-search" className="sr-only">
              Search notes
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              id="note-search"
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search notes"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        )}

        {onNewNote && (
          <Button className="ml-auto sm:order-3" onClick={onNewNote} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            New note
          </Button>
        )}
      </div>
    </header>
  );
}
