"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Whether the hero ken-burns has played once during this client session.
// Re-mounts after a client-side navigation back to the storefront read
// this as already-true and skip the animation, so the hero never "zooms
// snap" on every return.
let kenBurnsRan = false;

export function HeroBackdrop({ children }: { children: React.ReactNode }) {
  const [shouldAnimate] = useState(() => !kenBurnsRan);
  useEffect(() => {
    kenBurnsRan = true;
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute inset-0",
          shouldAnimate && "animate-kenburns",
        )}
      >
        {children}
      </div>
    </div>
  );
}
