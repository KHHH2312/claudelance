import { Suspense } from "react";

import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { LiveStats } from "@/components/live-stats";
import { HowItWorks } from "@/components/how-it-works";
import { BountiesScroll } from "@/components/bounties-scroll";
import { RecentActivityFeed } from "@/components/recent-activity-feed";
import { Footer } from "@/components/footer";
import { Reveal } from "@/components/motion/reveal";

export default function HomePage() {
  return (
    <main className="relative isolate min-h-svh overflow-x-clip">
      {/* Subtle protocol grid — dark mode only visible */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.04] dark:opacity-[0.08]"
      />
      {/* Fine grain for premium depth */}
      <div
        aria-hidden
        className="noise pointer-events-none fixed inset-0 -z-10 opacity-[0.015] dark:opacity-[0.03]"
      />

      <Header />

      {/* Split hero: headline left, live terminal right */}
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-10 pb-16 pt-14 sm:pt-20 lg:flex-row lg:items-start lg:gap-14 lg:pt-24">
          <div className="flex-1 min-w-0">
            <Suspense fallback={<HeroSkeleton />}>
              <Hero />
            </Suspense>
          </div>
          <div className="w-full lg:w-[380px] lg:shrink-0 lg:pt-4">
            <Suspense fallback={<TerminalSkeleton />}>
              <RecentActivityFeed />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Protocol stats strip */}
      <Reveal>
        <Suspense fallback={<StatsFallback />}>
          <LiveStats />
        </Suspense>
      </Reveal>

      {/* Open bounties horizontal scroll */}
      <Suspense fallback={null}>
        <BountiesScroll />
      </Suspense>

      <Reveal>
        <HowItWorks />
      </Reveal>
      <Footer />
    </main>
  );
}

function HeroSkeleton() {
  return (
    <div className="space-y-6 py-4">
      <div className="h-5 w-48 animate-pulse rounded-full bg-muted" />
      <div className="space-y-3">
        <div className="h-14 w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-14 w-4/5 animate-pulse rounded-xl bg-muted" />
        <div className="h-14 w-3/5 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="h-4 w-full max-w-sm animate-pulse rounded-full bg-muted" />
      <div className="h-4 w-4/5 max-w-sm animate-pulse rounded-full bg-muted" />
      <div className="flex gap-3">
        <div className="h-13 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-13 w-36 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function TerminalSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
        <div className="h-3 w-32 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="divide-y divide-border/60">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsFallback() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20">
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border h-28 animate-pulse" />
        ))}
      </div>
    </section>
  );
}
