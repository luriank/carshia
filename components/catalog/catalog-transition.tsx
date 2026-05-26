"use client";

import {
  createContext,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigateOptions = { scroll?: boolean };

type CatalogTransitionValue = {
  navigate: (url: string, opts?: NavigateOptions) => void;
  isPending: boolean;
};

const CatalogTransitionContext =
  createContext<CatalogTransitionValue | null>(null);

/**
 * Wraps the catalog so filter/sort/pagination navigations run inside a
 * React transition. The previous product list stays mounted (dimmed via
 * {@link CatalogPending}) instead of being replaced by the route-level
 * `loading.tsx` skeleton on every searchParam change.
 */
export function CatalogTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const value = useMemo<CatalogTransitionValue>(
    () => ({
      isPending,
      navigate: (url, opts) =>
        startTransition(() =>
          router.push(url, { scroll: opts?.scroll ?? true }),
        ),
    }),
    [isPending, router, startTransition],
  );

  return (
    <CatalogTransitionContext.Provider value={value}>
      {children}
    </CatalogTransitionContext.Provider>
  );
}

/**
 * Returns the catalog transition. Falls back to a local transition when used
 * outside a {@link CatalogTransitionProvider} (e.g. the global header search),
 * so navigation still keeps the current view instead of a naked `router.push`.
 */
export function useCatalogTransition(): CatalogTransitionValue {
  const ctx = useContext(CatalogTransitionContext);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const fallback = useMemo<CatalogTransitionValue>(
    () => ({
      isPending,
      navigate: (url, opts) =>
        startTransition(() =>
          router.push(url, { scroll: opts?.scroll ?? true }),
        ),
    }),
    [isPending, router, startTransition],
  );

  return ctx ?? fallback;
}

/** Dims and disables its subtree while a catalog transition is pending. */
export function CatalogPending({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isPending } = useCatalogTransition();
  return (
    <div
      aria-busy={isPending}
      className={cn(
        "transition-opacity duration-300 motion-reduce:transition-none",
        isPending && "pointer-events-none opacity-60",
        className,
      )}
    >
      {children}
    </div>
  );
}
