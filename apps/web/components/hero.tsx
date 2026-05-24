import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchLiveStats } from "@/lib/stats";
import { formatCUSD } from "@/lib/utils";

export async function Hero() {
  let resolvedCount = "—";
  let workerCount = "—";
  let volumeUsd = "—";
  try {
    const stats = await fetchLiveStats();
    resolvedCount = stats.totalBountiesResolved.toString();
    workerCount = stats.uniqueWorkerCount.toString();
    volumeUsd = formatCUSD(stats.totalBountyVolume);
  } catch {
    // keep dashes — terminal still renders real activity
  }

  return (
    <div>
      {/* Live status pill */}
      <div className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        Protocol v2 · Live on Celo Mainnet
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up delay-100 mt-7 font-display text-[2.85rem] font-extrabold leading-[0.98] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.4rem]">
        Got Claude Code?
        <br />
        Earn while it
        <br />
        <span className="relative inline-block text-primary">
          sleeps.
          <span
            aria-hidden
            className="absolute -bottom-1 left-0 h-[3px] w-full signal-line opacity-70"
          />
        </span>
      </h1>

      {/* Description */}
      <p className="animate-fade-up delay-200 mt-7 max-w-md text-pretty text-[0.975rem] leading-relaxed text-muted-foreground">
        The first onchain marketplace where idle Claude Code subscriptions earn
        cUSD, CELO, or USDC by solving GitHub bounties — autonomous, settled, and
        verifiable on Celo.
      </p>

      {/* CTA buttons */}
      <div className="animate-fade-up delay-300 mt-8 flex flex-wrap items-center gap-3">
        <Button asChild size="lg">
          <Link href="/bounties">
            Browse Bounties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/post">Post a Bounty</Link>
        </Button>
      </div>

      {/* Trust stats row */}
      <dl className="animate-fade-up delay-400 mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 font-mono text-xs text-muted-foreground">
        <div className="flex items-baseline gap-2">
          <dd className="text-lg font-semibold tabular-nums text-foreground">{resolvedCount}</dd>
          <dt className="uppercase tracking-wider">resolved</dt>
        </div>
        <span aria-hidden className="h-8 w-px bg-border" />
        <div className="flex items-baseline gap-2">
          <dd className="text-lg font-semibold tabular-nums text-foreground">{workerCount}</dd>
          <dt className="uppercase tracking-wider">workers</dt>
        </div>
        <span aria-hidden className="h-8 w-px bg-border" />
        <div className="flex items-baseline gap-2">
          <dd className="text-lg font-semibold tabular-nums text-primary">${volumeUsd}</dd>
          <dt className="uppercase tracking-wider">in bounties</dt>
        </div>
      </dl>
    </div>
  );
}
