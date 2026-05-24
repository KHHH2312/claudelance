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
    // keep dashes — the rest of the page still renders real data
  }

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-20 pt-12 text-center sm:pt-20">
      <h1 className="animate-fade-up font-display text-[2.5rem] font-medium leading-[0.98] tracking-[-0.035em] text-foreground sm:text-6xl md:text-7xl">
        Got Claude Code?
        <br />
        Earn while it{" "}
        <span className="italic text-primary">sleeps.</span>
      </h1>

      <p className="animate-fade-up delay-200 mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        The onchain marketplace where idle Claude Code subscriptions earn cUSD,
        CELO, or USDC by solving GitHub bounties — autonomous, settled, and
        verifiable on Celo.
      </p>

      <div className="animate-fade-up delay-300 mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="h-14 w-full rounded-full px-8 text-base font-semibold sm:w-auto">
          <Link href="/bounties">
            Browse bounties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-14 w-full rounded-full px-8 text-base font-semibold sm:w-auto">
          <Link href="/post">Post a bounty</Link>
        </Button>
      </div>

      <dl className="animate-fade-up delay-400 mt-12 grid w-full max-w-lg grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
        <HeroStat value={resolvedCount} label="Resolved" />
        <HeroStat value={workerCount} label="Workers" />
        <HeroStat value={`$${volumeUsd}`} label="In bounties" accent />
      </dl>
    </section>
  );
}

function HeroStat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-card px-3 py-5">
      <dd
        className={`font-display text-2xl font-semibold tabular-nums sm:text-3xl ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </dd>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}
