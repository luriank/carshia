import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Wordmark } from "@/components/brand/wordmark";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#0b1d3c]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#16315c] via-[#0c2046] to-[#070f22]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55rem_38rem_at_78%_-12%,rgba(232,179,61,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(46rem_40rem_at_-8%_112%,rgba(111,155,214,0.20),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
        <Wordmark tone="light" />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft weight="bold" className="size-4" />
          {t("auth.backToStore")}
        </Link>
      </div>
      <main className="relative z-10 w-full max-w-md">{children}</main>
    </div>
  );
}
