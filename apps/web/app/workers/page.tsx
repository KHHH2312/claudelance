import { Header } from "@/components/header";
import { GlassCard } from "@/components/ui/card";
import { WorkersTable, type WorkerRow } from "@/components/workers-table";
import { fetchActiveWorkers } from "@/lib/active-workers";
import { formatTokenAmount } from "@/lib/format-token";

export const revalidate = 30;

function WorkersSummary({
  uniqueCount,
  totalWins,
  totalPayout,
}: {
  uniqueCount: number;
  totalWins: number;
  totalPayout: string;
}) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-3">
      <GlassCard className="!p-4 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Workers</p>
        <p className="mt-1 font-display text-2xl font-semibold">{uniqueCount}</p>
      </GlassCard>
      <GlassCard className="!p-4 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Wins</p>
        <p className="mt-1 font-display text-2xl font-semibold">{totalWins}</p>
      </GlassCard>
      <GlassCard className="!p-4 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">CELO</p>
        <p className="mt-1 font-display text-2xl font-semibold">{totalPayout}</p>
      </GlassCard>
    </div>
  );
}

export default async function WorkersPage() {
  let workers: Awaited<ReturnType<typeof fetchActiveWorkers>> = [];
  try {
    workers = await fetchActiveWorkers();
  } catch {
    // Render empty state if RPC trips.
  }

  const rows: WorkerRow[] = workers.map((worker, index) => ({
    rank: index + 1,
    address: worker.address,
    wins: worker.wins,
    payout: formatTokenAmount(worker.totalPayout, 18, 2),
    hasIdentity: worker.hasIdentity,
  }));

  const totalWins = workers.reduce((sum, worker) => sum + worker.wins, 0);
  const totalPayout = formatTokenAmount(
    workers.reduce((sum, worker) => sum + worker.totalPayout, 0n),
    18,
    2,
  );

  return (
    <main className="relative isolate min-h-svh overflow-x-clip">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Worker leaderboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Active workers
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Every row is derived live from on-chain BountyResolved events on the
          Core contract — no addresses are hardcoded. Open a wallet to see its
          on-chain win history, or jump straight to Celoscan.
        </p>

        {workers.length > 0 && (
          <WorkersSummary
            uniqueCount={workers.length}
            totalWins={totalWins}
            totalPayout={totalPayout}
          />
        )}

        <WorkersTable rows={rows} />
      </section>
    </main>
  );
}
