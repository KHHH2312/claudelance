import "server-only";

import { createPublicClient, http, parseAbi, type Address } from "viem";

import { celoMainnet } from "@/lib/chain";
import { getDeployment } from "@/lib/contracts";

const [bountyResolvedEvent] = parseAbi([
  "event BountyResolved(uint256 indexed bountyId, address indexed winner, uint96 winnerPayout, uint96 protocolFee)",
] as const);

const rpcOverride = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC;

/** ~23 days at Celo's L2 1s blocktime — covers the full contract history to
 *  date so the worker dashboard surfaces every win without a paginator. The
 *  query is filtered by the indexed `winner`, so the wide range stays cheap. */
const HISTORY_WINDOW_BLOCKS = 2_000_000n;

export type WorkerHistoryRow = {
  bountyId: bigint;
  winnerPayout: bigint;
  protocolFee: bigint;
  txHash: `0x${string}`;
  blockNumber: bigint;
};

export async function fetchWorkerHistory(worker: Address): Promise<WorkerHistoryRow[]> {
  const client = createPublicClient({ chain: celoMainnet, transport: http(rpcOverride) });
  const deploy = getDeployment(celoMainnet.id);

  const latest = await client.getBlockNumber();
  const fromBlock =
    latest > HISTORY_WINDOW_BLOCKS ? latest - HISTORY_WINDOW_BLOCKS : 0n;

  const logs = await client.getLogs({
    address: deploy.core as Address,
    event: bountyResolvedEvent,
    args: { winner: worker },
    fromBlock,
    toBlock: latest,
  });

  return logs
    .map((log) => ({
      bountyId: log.args.bountyId!,
      winnerPayout: log.args.winnerPayout!,
      protocolFee: log.args.protocolFee!,
      txHash: log.transactionHash!,
      blockNumber: log.blockNumber!,
    }))
    .sort((a, b) => Number(b.blockNumber - a.blockNumber));
}
