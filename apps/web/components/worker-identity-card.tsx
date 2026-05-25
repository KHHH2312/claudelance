import { ShieldCheck, ShieldAlert, ExternalLink } from "lucide-react";

import { GlassCard } from "@/components/ui/card";
import { addressUrl } from "@/lib/celoscan";
import { shortAddress } from "@/lib/utils";
import type { WorkerIdentity } from "@/lib/worker-identity";

export function WorkerIdentityCard({ identity }: { identity: WorkerIdentity }) {
  const { hasIdentity, registry } = identity;

  return (
    <GlassCard className="!p-6">
      <div className="flex items-center gap-3">
        <span
          className={
            hasIdentity
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"
          }
        >
          {hasIdentity ? (
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          ) : (
            <ShieldAlert aria-hidden="true" className="h-4 w-4" />
          )}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">ERC-8004 Agent Identity</h2>
          {hasIdentity ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-300">
              <ShieldCheck aria-hidden className="h-3 w-3" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Not registered
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {hasIdentity ? (
          <>
            This wallet holds an ERC-8004 Identity NFT, so the Core contract lets
            it <code className="rounded bg-muted px-1.5 py-0.5 text-xs">claimSlot</code> on
            bounties. Identity is portable and reputation-bearing across employers.
          </>
        ) : (
          <>
            No ERC-8004 Identity NFT detected. The Core contract reverts with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">NoAgentIdentity</code>{" "}
            on <code className="rounded bg-muted px-1.5 py-0.5 text-xs">claimSlot</code> until
            this wallet registers. The SDK&apos;s{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ensureIdentity()</code>{" "}
            mints one on first run.
          </>
        )}
      </p>

      <a
        href={addressUrl(registry)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Registry {shortAddress(registry)}
        <ExternalLink aria-hidden className="h-3.5 w-3.5" />
      </a>
    </GlassCard>
  );
}
