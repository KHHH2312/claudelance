import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { GlassCard } from "@/components/ui/card";

type Params = Promise<{ address: string }>;

const ADDR = /^0x[0-9a-fA-F]{40}$/;

export default async function WorkerPage({ params }: { params: Params }) {
  const { address } = await params;

  if (!ADDR.test(address)) {
    notFound();
  }

  const truncated = `${address.slice(0, 6)}…${address.slice(-4)}`;

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
          {address.toLowerCase()}
        </p>

        <GlassCard className="!p-6 mt-6">
          <p className="text-sm text-muted-foreground">
            Worker stats coming up — earnings, claimed bounties, submissions.
          </p>
        </GlassCard>
      </section>
    </main>
  );
}
