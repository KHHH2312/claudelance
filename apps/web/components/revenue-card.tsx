import { fetchTreasuryRevenue } from "@/lib/revenue";
import { getCeloUsdPrice } from "@/lib/price";
import { formatTokenAmount } from "@/lib/format-token";

export async function RevenueCard() {
  const [r, celoUsd] = await Promise.all([fetchTreasuryRevenue(), getCeloUsdPrice()]);

  const cusdUsd = Number(r.cUSD) / 1e18;
  const usdcUsd = Number(r.USDC) / 1e6;
  const celoUsdValue = (Number(r.CELO) / 1e18) * celoUsd;
  const usdTotal = cusdUsd + usdcUsd + celoUsdValue;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card/50">
      {/* Headline figure */}
      <div className="border-b border-border p-6 sm:p-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
          Total protocol revenue · USD
        </p>
        <p className="mt-3 font-mono text-5xl font-bold tracking-tight text-primary tabular-nums sm:text-6xl">
          ${usdTotal.toFixed(2)}
        </p>
        <p className="mt-3 max-w-md font-mono text-[0.7rem] text-muted-foreground/70">
          2% fee on every resolved bounty, plus forfeited stake. CELO valued at $
          {celoUsd.toFixed(2)} (live). cUSD and USDC at peg.
        </p>
      </div>

      {/* Per-token breakdown */}
      <div className="grid grid-cols-3 gap-px bg-border">
        <PerToken label="cUSD" amount={r.cUSD} decimals={18} accent />
        <PerToken label="CELO" amount={r.CELO} decimals={18} />
        <PerToken label="USDC" amount={r.USDC} decimals={6} />
      </div>
    </div>
  );
}

function PerToken({
  label,
  amount,
  decimals,
  accent,
}: {
  label: string;
  amount: bigint;
  decimals: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-card p-5 sm:p-6">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-mono text-xl font-bold tabular-nums sm:text-2xl ${accent ? "text-primary" : "text-foreground"}`}
      >
        {formatTokenAmount(amount, decimals, 4)}
      </span>
    </div>
  );
}
