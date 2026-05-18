import "server-only";

import { createPublicClient, http } from "viem";
import type { Address } from "viem";
import {
  CLAUDELANCE_CORE_ABI,
  MAINNET,
} from "@yeheskieltame/claudelance-types";

import { celoMainnet, DEFAULT_CHAIN_ID } from "@/lib/chain";
import { getDeployment } from "@/lib/contracts";

export type TokenEarnings = {
  symbol: "cUSD" | "CELO" | "USDC";
  token: Address;
  amount: bigint;
};

export type WorkerStats = {
  earnings: TokenEarnings[];
};

export async function fetchWorkerStats(worker: Address): Promise<WorkerStats> {
  const deployment = getDeployment(DEFAULT_CHAIN_ID);
  const client = createPublicClient({
    chain: celoMainnet,
    transport: http(process.env.NEXT_PUBLIC_CELO_MAINNET_RPC),
  });

  const tokens = [
    { symbol: "cUSD" as const, token: MAINNET.tokens.cUSD as Address },
    { symbol: "CELO" as const, token: MAINNET.tokens.CELO as Address },
    { symbol: "USDC" as const, token: MAINNET.tokens.USDC as Address },
  ];

  const earnings = await Promise.all(
    tokens.map(async (entry) => {
      try {
        const amount = (await client.readContract({
          address: deployment.core as Address,
          abi: CLAUDELANCE_CORE_ABI,
          functionName: "earnings",
          args: [worker, entry.token],
        })) as bigint;
        return { ...entry, amount };
      } catch {
        return { ...entry, amount: 0n };
      }
    }),
  );

  return { earnings };
}
