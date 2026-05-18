import { notFound } from "next/navigation";
import type { Address } from "viem";

import { Header } from "@/components/header";
import { WorkerEarningsCard } from "@/components/worker-earnings-card";
import { fetchWorkerStats } from "@/lib/worker-stats";

type Params = Promise<{ address: string }>;

const ADDR = /^0x[0-9a-fA-F]{40}$/;

export const revalidate = 30;

export default async function WorkerPage({ params }: { params: Params }) {
  const { address } = await params;

  if (!ADDR.test(address)) {
    notFound();
  }

  const lowercased = address.toLowerCase() as Address;
  const truncated = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const stats = await fetchWorkerStats(lowercased);

  return (
    <main className="relative isolate min-h-svh overflow-x-clip">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Worker dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {truncated}
        </h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
          {lowercased}
        </p>

        <div className="mt-6 grid gap-4">
          <WorkerEarningsCard earnings={stats.earnings} />
        </div>
      </section>
    </main>
  );
}
