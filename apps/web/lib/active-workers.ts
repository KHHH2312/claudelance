import "server-only";

import { createPublicClient, http, parseAbi, type Address } from "viem";

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

const bountyResolvedEvent = parseAbi([
  "event BountyResolved(uint256 indexed bountyId, address indexed winner, uint96 winnerPayout, uint96 protocolFee)",
]);

const rpcOverride = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC;

/** ~6 days at Celo's 5s blocktime — leaderboard window short enough
 *  to reflect recent activity, long enough to avoid an empty list. */
const LEADERBOARD_WINDOW_BLOCKS = 100_000n;

export type ActiveWorker = {
  address: Address;
  wins: number;
  totalPayout: bigint;
  lastBlock: bigint;
  hasIdentity: boolean;
  /** ERC-8004 agent id (Identity NFT token id), if known. */
  agentId?: bigint;
  /** Number of on-chain ERC-8004 feedback entries (reputation). */
  feedbackCount: number;
};

export async function fetchActiveWorkers(): Promise<ActiveWorker[]> {
  const client = createPublicClient({ chain: celoMainnet, transport: http(rpcOverride) });
  const deploy = getDeployment(celoMainnet.id);

  const latest = await client.getBlockNumber();
  const fromBlock =
    latest > LEADERBOARD_WINDOW_BLOCKS ? latest - LEADERBOARD_WINDOW_BLOCKS : 0n;

  const logs = await client.getLogs({
    address: deploy.core as Address,
    events: bountyResolvedEvent,
    fromBlock,
    toBlock: latest,
  });

  const map = new Map<Address, Omit<ActiveWorker, "hasIdentity" | "agentId" | "feedbackCount">>();
  for (const log of logs) {
    const winner = log.args.winner!;
    const payout = log.args.winnerPayout!;
    const block = log.blockNumber!;
    const row = map.get(winner);
    if (row) {
      row.wins += 1;
      row.totalPayout += payout;
      if (block > row.lastBlock) row.lastBlock = block;
    } else {
      map.set(winner, { address: winner, wins: 1, totalPayout: payout, lastBlock: block });
    }
  }

  const workerList = Array.from(map.values()).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return Number(b.lastBlock - a.lastBlock);
  });

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
    ...w,
    hasIdentity:
      identityResults[i]?.status === "success" &&
      (identityResults[i].result as bigint) > 0n,
    agentId: agentIds[i],
    feedbackCount: feedbackByIndex.get(i) ?? 0,
  }));
}
