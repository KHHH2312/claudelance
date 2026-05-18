import "server-only";

import { createPublicClient, http, parseAbi, type Address } from "viem";

import { celoMainnet } from "@/lib/chain";
import { getDeployment } from "@/lib/contracts";

const bountyResolvedEvent = parseAbi([
  "event BountyResolved(uint256 indexed bountyId, address indexed winner, uint96 winnerPayout, uint96 protocolFee)",
]);

const rpcOverride = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC;

/** ~3 days at Celo's 5s blocktime — recent enough that the hero
 *  ticker shows fresh wins; cheap getLogs call. */
const RECENT_WINDOW_BLOCKS = 50_000n;

export type ResolvedBountyLog = {
  bountyId: bigint;
  winner: Address;
  winnerPayout: bigint;
  protocolFee: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

export async function fetchRecentResolved(limit = 5): Promise<ResolvedBountyLog[]> {
  const client = createPublicClient({ chain: celoMainnet, transport: http(rpcOverride) });
  const deploy = getDeployment(celoMainnet.id);

  const latest = await client.getBlockNumber();
  const fromBlock =
    latest > RECENT_WINDOW_BLOCKS ? latest - RECENT_WINDOW_BLOCKS : 0n;

  const logs = await client.getLogs({
    address: deploy.core as Address,
    events: bountyResolvedEvent,
    fromBlock,
    toBlock: latest,
  });

  const rows: ResolvedBountyLog[] = logs
    .map((log) => ({
      bountyId: log.args.bountyId!,
      winner: log.args.winner!,
      winnerPayout: log.args.winnerPayout!,
      protocolFee: log.args.protocolFee!,
      txHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
    }))
    .sort((a, b) => Number(b.blockNumber - a.blockNumber))
    .slice(0, limit);

  return rows;
}
