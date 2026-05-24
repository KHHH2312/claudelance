# Claudelance Protocol Keeper (`apps/relayer`)

The always-on service behind the protocol's **ERC-8004 agent** (mainnet
`agentId 9144`, wallet `0x1fEDda23c2945D59f3929e6C463cF685aC077ad5`). It gives
that registered identity a real, continuous job — distinct from the worker
agents — so the marketplace runs without anyone settling bounties by hand.

## What it does

1. **CI attestation relayer.** On a GitHub `workflow_run` / `check_suite`
   webhook it matches the run's head SHA to an on-chain submission (via the
   `PRSubmitted` event's `commitHash`) and, for CI-required bounties, writes the
   pass/fail verdict on-chain with `attestCI`. This is the only role the
   contract gates to the relayer key, and it makes the poster's winner choice
   verifiable instead of self-reported.
2. **Settlement keeper.** A periodic heartbeat scans every bounty and runs the
   permissionless lifecycle calls so nothing waits on a human:
   - `settleStake(bountyId, worker)` for each unsettled claimer once a bounty is
     Resolved or Cancelled (refund or forfeit per the contract rules);
   - `cancelExpired(bountyId)` once an Open bounty passes its deadline + the
     3-day grace window.

Both keeper calls are permissionless, so any operator can run this; the
attestation requires the registered relayer key.

## Safety

- **`DRY_RUN=true` is the default.** The keeper computes and logs every action
  but broadcasts nothing and needs no key. Flip to `DRY_RUN=false` and provide
  `RELAYER_PRIVATE_KEY` to let it sign.
- The webhook endpoint rejects any request without a valid
  `X-Hub-Signature-256` (HMAC-SHA256 over the raw body) when a secret is set,
  and refuses to serve at all if no secret is configured.
- Every decision is mirrored from an on-chain guard, so the keeper never queues
  a call that would revert. Settlement is idempotent (the contract's
  per-submission settled flag); attestation skips when the on-chain verdict
  already matches.
- The signing key is read only from `RELAYER_PRIVATE_KEY` — never committed.

## Run

```bash
cp .env.example .env   # set RELAYER_NETWORK, GITHUB_WEBHOOK_SECRET, etc.
pnpm install
pnpm --filter claudelance-relayer dev     # tsx watch, DRY_RUN on by default
# or, to actually sign:  DRY_RUN=false RELAYER_PRIVATE_KEY=0x... pnpm --filter claudelance-relayer start
```

Point a GitHub webhook (events: `workflow_run` or `check_suite`) at
`POST /webhooks/github`.

| Route | Purpose |
|-------|---------|
| `GET /` | Agent identity + role + dry-run status |
| `GET /health` | Liveness (network + Core address) |
| `POST /webhooks/github` | Signed CI webhook → `attestCI` |

## Test

```bash
pnpm --filter claudelance-relayer test        # node:test via tsx
pnpm --filter claudelance-relayer typecheck
```

The keeper and attestation decision logic are pure functions
(`src/decisions.ts`) covered by `src/decisions.test.ts`; webhook signature
verification + payload parsing are covered by `src/github.test.ts`.

## Stack

Hono (HTTP) + viem (chain) + `@yeheskieltame/claudelance-sdk` for the ABI,
deployment records, and chain definitions. No database — the webhook resolves
submissions directly from `PRSubmitted` logs (set `EVENTS_FROM_BLOCK` to the
Core deploy block on mainnet to keep that scan fast).
