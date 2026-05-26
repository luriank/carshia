import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AuthCard({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl border border-white/30 bg-card/80 p-6 shadow-[0_24px_80px_-24px_rgba(3,10,28,0.7)] ring-1 ring-black/5 backdrop-blur-2xl sm:p-8",
        className,
      )}
    >
      <div className="mb-7 flex flex-col items-center gap-4 text-center">
        {icon ?? (
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10">
            <span className="block size-3 rounded-full bg-gold" />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="font-display text-[1.75rem] font-medium">
            {title}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
