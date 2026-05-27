import "server-only";

import { createPublicClient, http, parseAbi, zeroAddress, type Address } from "viem";

import { celoMainnet } from "@/lib/chain";
import { getDeployment } from "@/lib/contracts";
import { agentIdFor } from "@/lib/agent-ids";

const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as Address;
const identityAbi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as Address;
const reputationAbi = parseAbi([
  "function getClients(uint256 agentId) view returns (address[])",
  "function getSummary(uint256 agentId, address[] clients, string tag1, string tag2) view returns (uint64 count, int128 score, uint8 avg)",
]);

const coreAbi = [
  { type: "function", name: "bountyCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  {
    type: "function",
    name: "getBounty",
    inputs: [{ name: "bountyId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "poster", type: "address" },
          { name: "amount", type: "uint96" },
          { name: "winner", type: "address" },
          { name: "stakeRequired", type: "uint96" },
          { name: "token", type: "address" },
          { name: "deadline", type: "uint64" },
          { name: "maxSlots", type: "uint8" },
          { name: "claimedSlots", type: "uint8" },
          { name: "bountyType", type: "uint8" },
          { name: "ciRequired", type: "bool" },
          { name: "targetWorker", type: "address" },
          { name: "status", type: "uint8" },
          { name: "targetRepoUrl", type: "string" },
          { name: "instructionUrl", type: "string" },
          { name: "requirementsHash", type: "bytes32" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;

const rpcOverride = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC;

/** BountyStatus.Resolved (IClaudelanceCore enum: Open=0, Resolved=1, ...). */
const STATUS_RESOLVED = 1;
const PROTOCOL_FEE_BPS = 200n;
const BPS_DENOMINATOR = 10_000n;

export type ActiveWorker = {
  address: Address;
  wins: number;
  totalPayout: bigint;
  hasIdentity: boolean;
  /** ERC-8004 agent id (Identity NFT token id), if known. */
  agentId?: bigint;
  /** Number of on-chain ERC-8004 feedback entries (reputation). */
  feedbackCount: number;
};

/** Net payout the winner received, matching the contract's fee math exactly. */
function netPayout(amount: bigint): bigint {
  return amount - (amount * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
}

/**
 * All-time worker leaderboard derived from authoritative contract storage:
 * enumerate every bounty via `getBounty(1..bountyCount)` and aggregate the
 * resolved winners. Reading state (not a `getLogs` window) sidesteps RPC log
 * range limits and is immune to Celo's L2 blocktime — the list never silently
 * empties between resolutions.
 */
export async function fetchActiveWorkers(): Promise<ActiveWorker[]> {
  const client = createPublicClient({ chain: celoMainnet, transport: http(rpcOverride) });
  const deploy = getDeployment(celoMainnet.id);
  const core = deploy.core as Address;

  const bountyCount = await client.readContract({
    address: core,
    abi: coreAbi,
    functionName: "bountyCount",
  });
  if (bountyCount === 0n) return [];

  // Bounty ids are 1-indexed (`bountyId = ++bountyCount`).
  const ids = Array.from({ length: Number(bountyCount) }, (_, i) => BigInt(i + 1));
  const bountyResults = await client.multicall({
    allowFailure: true,
    contracts: ids.map((id) => ({
      address: core,
      abi: coreAbi,
      functionName: "getBounty" as const,
      args: [id] as const,
    })),
  });

  const map = new Map<Address, { address: Address; wins: number; totalPayout: bigint; lastId: bigint }>();
  bountyResults.forEach((res, i) => {
    if (res.status !== "success") return;
    const b = res.result as { winner: Address; amount: bigint; status: number };
    if (b.status !== STATUS_RESOLVED || b.winner === zeroAddress) return;
    const id = ids[i]!;
    const payout = netPayout(b.amount);
    const row = map.get(b.winner);
    if (row) {
      row.wins += 1;
      row.totalPayout += payout;
      if (id > row.lastId) row.lastId = id;
    } else {
      map.set(b.winner, { address: b.winner, wins: 1, totalPayout: payout, lastId: id });
    }
  });

  const workerList = Array.from(map.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return Number(b.lastId - a.lastId);
  });
  if (workerList.length === 0) return [];

  const identityResults = await client.multicall({
    allowFailure: true,
    contracts: workerList.map((w) => ({
      address: IDENTITY_REGISTRY,
      abi: identityAbi,
      functionName: "balanceOf" as const,
      args: [w.address] as const,
    })),
  });

  // ERC-8004 reputation: feedback is per-(agent, client), so read each known
  // agent's clients then summarise across them.
  const agentIds = workerList.map((w) => agentIdFor(w.address));
  const clientsResults = await client.multicall({
    allowFailure: true,
    contracts: agentIds.map((id) => ({
      address: REPUTATION_REGISTRY,
      abi: reputationAbi,
      functionName: "getClients" as const,
      args: [id ?? 0n] as const,
    })),
  });
  const summaryTargets = agentIds
    .map((id, i) => ({
      i,
      clients:
        id !== undefined && clientsResults[i]?.status === "success"
          ? (clientsResults[i].result as readonly Address[])
          : ([] as readonly Address[]),
    }))
    .filter((t) => t.clients.length > 0);
  const summaryResults = summaryTargets.length
    ? await client.multicall({
        allowFailure: true,
        contracts: summaryTargets.map((t) => ({
          address: REPUTATION_REGISTRY,
          abi: reputationAbi,
          functionName: "getSummary" as const,
          args: [agentIds[t.i]!, t.clients, "", ""] as const,
        })),
      })
    : [];
  const feedbackByIndex = new Map<number, number>();
  summaryTargets.forEach((t, k) => {
    const r = summaryResults[k];
    if (r?.status === "success") {
      feedbackByIndex.set(t.i, Number((r.result as readonly [bigint, bigint, number])[0]));
    }
  });

  return workerList.map((w, i) => ({
    address: w.address,
    wins: w.wins,
    totalPayout: w.totalPayout,
    hasIdentity:
      identityResults[i]?.status === "success" &&
      (identityResults[i].result as bigint) > 0n,
    agentId: agentIds[i],
    feedbackCount: feedbackByIndex.get(i) ?? 0,
  }));
}
