"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CircleNotch, MagnifyingGlass, X } from "@phosphor-icons/react/ssr";
import { useTranslations } from "next-intl";
import { useCatalogTransition } from "@/components/catalog/catalog-transition";
import { Input } from "@/components/ui/input";
import { formatPrice, discountedPrice } from "@/lib/format";
import { findFoldedRange } from "@/lib/search-text";
import { cn } from "@/lib/utils";
import type { SuggestItem } from "@/app/api/search/suggest/route";
import type { PopularCategory } from "@/app/api/search/popular/route";

const DEBOUNCE_MS = 180;
const MIN_QUERY = 2;
const RECENT_KEY = "dardania:recent-searches:v1";
const RECENT_MAX = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)));
  } catch {
    // localStorage full or disabled — silently ignore.
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

export function SearchBar({
  className,
  onSubmitted,
  enableHotkey,
  variant = "default",
}: {
  className?: string;
  onSubmitted?: () => void;
  /** When true, registers ⌘K / Ctrl+K / "/" global hotkey to focus this bar. */
  enableHotkey?: boolean;
  /** `"default"` — pill rounded muted background.
   *  `"header"` — Amazon-style: white input with gold submit and an "All"
   *  scope chip on the left, designed to sit on the dark header bar. */
  variant?: "default" | "header";
}) {
  const t = useTranslations();
  const { navigate } = useCatalogTransition();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [mode, setMode] = useState<"substring" | "fuzzy" | "empty">("empty");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const [popular, setPopular] = useState<PopularCategory[]>([]);
  const [hotkeyLabel, setHotkeyLabel] = useState<string | null>(null);
  const lastFetchedQ = useRef<string>("");
  const wrapperRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const trimmed = value.trim();
  const canSuggest = trimmed.length >= MIN_QUERY;

  // Hydrate recent from localStorage + decide hotkey label on mount.
  useEffect(() => {
    setRecent(loadRecent());
    if (enableHotkey) setHotkeyLabel(isMac() ? "⌘K" : "Ctrl K");
  }, [enableHotkey]);

  // Fetch popular categories once (cheap; cached by the route for 5 min).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/search/popular")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { categories: PopularCategory[] } | null) => {
        if (cancelled || !data) return;
        setPopular(data.categories);
      })
      .catch(() => {
        // Non-fatal — empty state simply omits the popular strip.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced fetch with stale-request cancellation.
  useEffect(() => {
    if (!canSuggest) {
      setItems([]);
      setMode("empty");
      setLoading(false);
      lastFetchedQ.current = "";
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error("suggest failed");
        const data: {
          q: string;
          items: SuggestItem[];
          mode: "substring" | "fuzzy" | "empty";
        } = await res.json();
        if (controller.signal.aborted) return;
        lastFetchedQ.current = trimmed;
        setItems(data.items);
        setMode(data.mode);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setItems([]);
        setMode("empty");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed, canSuggest]);

  // Sync input with the URL's ?q on client-side navigation — but only when
  // the user isn't actively typing here.
  const urlQ = params.get("q") ?? "";
  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setValue(urlQ);
  }, [urlQ]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  // Global ⌘K / Ctrl+K / "/" hotkey to focus.
  useEffect(() => {
    if (!enableHotkey) return;
    function onKey(e: KeyboardEvent) {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isSlash =
        e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isModK && !isSlash) return;
      if (isSlash && isEditableTarget(e.target)) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableHotkey]);

  const pushRecent = useCallback((q: string) => {
    const norm = q.trim();
    if (!norm) return;
    setRecent((prev) => {
      const next = [norm, ...prev.filter((p) => p.toLowerCase() !== norm.toLowerCase())].slice(
        0,
        RECENT_MAX,
      );
      saveRecent(next);
      return next;
    });
  }, []);

  const removeRecent = useCallback((q: string) => {
    setRecent((prev) => {
      const next = prev.filter((p) => p !== q);
      saveRecent(next);
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    saveRecent([]);
  }, []);

  const goToProduct = useCallback(
    (slug: string, savedQuery?: string) => {
      setOpen(false);
      inputRef.current?.blur();
      if (savedQuery) pushRecent(savedQuery);
      navigate(`/product/${slug}`);
      onSubmitted?.();
    },
    [navigate, onSubmitted, pushRecent],
  );

  const runFullSearch = useCallback(
    (q: string) => {
      setOpen(false);
      inputRef.current?.blur();
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      pushRecent(q);
      navigate(qs ? `/?${qs}` : "/");
      onSubmitted?.();
    },
    [navigate, onSubmitted, params, pushRecent],
  );

  const goToCategory = useCallback(
    (slug: string) => {
      setOpen(false);
      inputRef.current?.blur();
      navigate(`/?category=${encodeURIComponent(slug)}`);
      onSubmitted?.();
    },
    [navigate, onSubmitted],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < items.length) {
      goToProduct(items[activeIndex].slug, trimmed);
      return;
    }
    runFullSearch(trimmed);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (open) {
        setOpen(false);
        setActiveIndex(-1);
        e.preventDefault();
      }
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => {
        if (items.length === 0) return -1;
        return i < 0 ? 0 : (i + 1) % items.length;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => {
        if (items.length === 0) return -1;
        return i <= 0 ? items.length - 1 : i - 1;
      });
    }
  }

  const showResultsPanel = open && trimmed.length > 0;
  const showEmptyPanel =
    open && trimmed.length === 0 && (recent.length > 0 || popular.length > 0);
  const showPanel = showResultsPanel || showEmptyPanel;
  const showEmpty =
    showResultsPanel &&
    canSuggest &&
    !loading &&
    items.length === 0 &&
    lastFetchedQ.current === trimmed;

  const isHeader = variant === "header";

  return (
    <form
      ref={wrapperRef}
      onSubmit={submit}
      className={cn("relative", isHeader && "flex items-stretch", className)}
      role="search"
    >
      {isHeader ? (
        <span
          aria-hidden
          className="pointer-events-none flex items-center rounded-l-md bg-[#f3f3f3] px-3 text-[12px] font-semibold text-foreground/70 ring-1 ring-inset ring-border"
        >
          {t("nav.scopeAll")}
        </span>
      ) : (
        <MagnifyingGlass
          weight="duotone"
          className="pointer-events-none absolute left-4 top-1/2 size-[1.1rem] -translate-y-1/2 text-primary"
        />
      )}
      <Input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={t("nav.searchPlaceholder")}
        aria-label={t("common.search")}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        aria-activedescendant={
          showPanel && activeIndex >= 0
            ? `${listboxId}-opt-${activeIndex}`
            : undefined
        }
        aria-keyshortcuts={enableHotkey ? "Meta+K Control+K /" : undefined}
        autoComplete="off"
        className={cn(
          "text-sm transition-colors",
          isHeader
            ? "h-11 flex-1 rounded-none border-y border-y-border bg-white px-3 text-foreground placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-0"
            : "h-11 rounded-full border-border/70 bg-muted/50 pl-11 pr-20 focus-visible:bg-background",
        )}
      />
      {isHeader ? (
        <button
          type="submit"
          aria-label={t("common.search")}
          className="flex h-11 w-12 shrink-0 items-center justify-center rounded-r-md bg-gold text-gold-foreground transition-colors hover:bg-[#f0c25a]"
        >
          {loading ? (
            <CircleNotch
              aria-hidden
              weight="bold"
              className="size-4 animate-spin"
            />
          ) : (
            <MagnifyingGlass weight="bold" className="size-5" />
          )}
        </button>
      ) : loading ? (
        <CircleNotch
          aria-hidden
          weight="bold"
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      ) : hotkeyLabel ? (
        <kbd
          aria-hidden
          title={t("nav.searchHotkeyHint", { key: hotkeyLabel })}
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex"
        >
          {hotkeyLabel}
        </kbd>
      ) : null}

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t("nav.searchSuggestions")}
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-border/70 bg-popover p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0_/0.25)] backdrop-blur-md"
        >
          {showResultsPanel && mode === "fuzzy" && items.length > 0 ? (
            <div className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {t("nav.searchFuzzyHint")}
            </div>
          ) : null}

          {showResultsPanel ? (
            <SuggestionList
              items={items}
              activeIndex={activeIndex}
              listboxId={listboxId}
              trimmed={trimmed}
              onActivate={setActiveIndex}
              onPick={(slug) => goToProduct(slug, trimmed)}
            />
          ) : null}

          {showEmpty ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("nav.searchNoResults", { q: trimmed })}
            </div>
          ) : null}

          {showResultsPanel && canSuggest ? (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runFullSearch(trimmed)}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border-t border-border/60 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              <MagnifyingGlass weight="duotone" className="size-4" />
              {t("nav.searchViewAll", { q: trimmed })}
            </button>
          ) : showResultsPanel ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              {t("nav.searchHint")}
            </div>
          ) : null}

          {showEmptyPanel ? (
            <EmptyStatePanel
              recent={recent}
              popular={popular}
              onPickRecent={runFullSearch}
              onRemoveRecent={removeRecent}
              onClearRecent={clearRecent}
              onPickCategory={goToCategory}
              labels={{
                recent: t("nav.searchRecent"),
                clear: t("nav.searchRecentClear"),
                remove: (q) => t("nav.searchRecentRemove", { q }),
                popular: t("nav.searchPopular"),
              }}
            />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

function SuggestionList({
  items,
  activeIndex,
  listboxId,
  trimmed,
  onActivate,
  onPick,
}: {
  items: SuggestItem[];
  activeIndex: number;
  listboxId: string;
  trimmed: string;
  onActivate: (i: number) => void;
  onPick: (slug: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item, i) => (
        <li key={item.id}>
          <button
            type="button"
            id={`${listboxId}-opt-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            tabIndex={-1}
            onMouseEnter={() => onActivate(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(item.slug)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
              i === activeIndex ? "bg-muted" : "hover:bg-muted/70",
            )}
          >
            <span className="relative block size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-gradient-to-br from-muted/60 to-muted/20">
              <Image
                src={item.thumbnail}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1"
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {highlight(item.title, trimmed)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate">{item.brandName}</span>
                <span aria-hidden className="opacity-60">
                  ·
                </span>
                <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] uppercase tracking-wide text-muted-foreground/90">
                  {item.categoryName}
                </span>
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatPrice(
                discountedPrice(item.price, item.discountPercentage),
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EmptyStatePanel({
  recent,
  popular,
  onPickRecent,
  onRemoveRecent,
  onClearRecent,
  onPickCategory,
  labels,
}: {
  recent: string[];
  popular: PopularCategory[];
  onPickRecent: (q: string) => void;
  onRemoveRecent: (q: string) => void;
  onClearRecent: () => void;
  onPickCategory: (slug: string) => void;
  labels: {
    recent: string;
    clear: string;
    remove: (q: string) => string;
    popular: string;
  };
}) {
  return (
    <div className="flex flex-col gap-3 px-1.5 py-1.5">
      {recent.length > 0 ? (
        <section>
          <header className="mb-1.5 flex items-center justify-between px-1.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.recent}
            </h3>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClearRecent}
              className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {labels.clear}
            </button>
          </header>
          <ul className="flex flex-wrap gap-1.5 px-1.5">
            {recent.map((q) => (
              <li key={q} className="flex items-stretch overflow-hidden rounded-full border border-border/60 bg-background/60">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPickRecent(q)}
                  className="px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  {q}
                </button>
                <button
                  type="button"
                  aria-label={labels.remove(q)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onRemoveRecent(q)}
                  className="border-l border-border/60 px-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X aria-hidden weight="bold" className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {popular.length > 0 ? (
        <section>
          <header className="mb-1.5 px-1.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {labels.popular}
            </h3>
          </header>
          <ul className="flex flex-wrap gap-1.5 px-1.5">
            {popular.map((c) => (
              <li key={c.slug}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPickCategory(c.slug)}
                  className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function highlight(text: string, q: string): ReactNode {
  if (!q) return text;
  const range = findFoldedRange(text, q);
  if (!range) return text;
  const [from, to] = range;
  return (
    <>
      {text.slice(0, from)}
      <mark className="rounded bg-primary/15 px-0.5 text-foreground">
        {text.slice(from, to)}
      </mark>
      {text.slice(to)}
    </>
  );
}
