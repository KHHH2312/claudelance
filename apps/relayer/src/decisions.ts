import { BountyStatus, type Bounty, type Submission } from '@yeheskieltame/claudelance-sdk';

/** Mirrors `RESOLUTION_GRACE_PERIOD` in ClaudelanceCore.sol. */
export const GRACE_PERIOD_SECONDS = 3n * 24n * 60n * 60n;

export type KeeperAction =
  | { kind: 'settleStake'; bountyId: bigint; worker: `0x${string}` }
  | { kind: 'cancelExpired'; bountyId: bigint };

export type ClaimerState = {
  worker: `0x${string}`;
  /** `stakeRefunded` is the contract's "stake already settled" flag (refund OR forfeit). */
  stakeSettled: boolean;
};

/**
 * Decide which permissionless keeper calls a bounty needs right now. Pure:
 * same inputs always produce the same actions. Each branch mirrors an
 * on-chain guard so the keeper never queues a call that would revert.
 */
export function decideKeeperActions(
  bountyId: bigint,
  bounty: Pick<Bounty, 'status' | 'deadline' | 'stakeRequired'>,
  claimers: ClaimerState[],
  nowSeconds: bigint,
  graceSeconds: bigint = GRACE_PERIOD_SECONDS,
): KeeperAction[] {
  if (bounty.status === BountyStatus.Open) {
    // Before deadline+grace only the poster may cancel; after, anyone (incl. the keeper).
    if (nowSeconds >= bounty.deadline + graceSeconds) {
      return [{ kind: 'cancelExpired', bountyId }];
    }
    return [];
  }

  // Resolved or Cancelled: sweep every stake still locked in the contract.
  if (
    (bounty.status === BountyStatus.Resolved || bounty.status === BountyStatus.Cancelled) &&
    bounty.stakeRequired > 0n
  ) {
    return claimers
      .filter((c) => !c.stakeSettled)
      .map((c) => ({ kind: 'settleStake', bountyId, worker: c.worker }) as const);
  }

  return [];
}

/** Map a CI run conclusion to a pass/fail verdict, or null when it isn't terminal. */
export function ciPassedFromConclusion(conclusion: string | null | undefined): boolean | null {
  switch (conclusion) {
    case 'success':
      return true;
    case 'failure':
    case 'timed_out':
    case 'startup_failure':
      return false;
    default:
      // cancelled / skipped / neutral / stale / action_required / null (in-progress)
      return null;
  }
}

export type AttestContext = {
  bountyId: bigint;
  worker: `0x${string}`;
  bountyStatus: BountyStatus;
  ciRequired: boolean;
};

export type AttestAction = {
  kind: 'attestCI';
  bountyId: bigint;
  worker: `0x${string}`;
  passed: boolean;
};

/**
 * Decide whether a CI conclusion should produce an on-chain attestation.
 * Returns null when attesting would be pointless (bounty not open, CI not
 * required) or premature (no terminal verdict yet).
 */
export function decideAttest(
  conclusion: string | null | undefined,
  ctx: AttestContext,
): AttestAction | null {
  if (ctx.bountyStatus !== BountyStatus.Open) return null;
  if (!ctx.ciRequired) return null;
  const passed = ciPassedFromConclusion(conclusion);
  if (passed === null) return null;
  return { kind: 'attestCI', bountyId: ctx.bountyId, worker: ctx.worker, passed };
}

/**
 * Right-pad a git commit SHA into the bytes32 `commitHash` a worker stores
 * on-chain via submitPR, so a CI webhook's head SHA can be matched back to a
 * submission.
 */
export function padCommitHash(sha: string): `0x${string}` {
  const hex = sha.replace(/^0x/, '').toLowerCase();
  return `0x${hex.padEnd(64, '0').slice(0, 64)}`;
}

export function commitMatches(headSha: string, onChainCommitHash: string): boolean {
  return padCommitHash(headSha) === (onChainCommitHash.toLowerCase() as `0x${string}`);
}

/** True when an already-stored submission's CI verdict differs from the new one. */
export function shouldReattest(submission: Pick<Submission, 'ciPassed'>, passed: boolean): boolean {
  return submission.ciPassed !== passed;
}
