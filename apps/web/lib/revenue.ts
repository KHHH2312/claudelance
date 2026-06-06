import { createPublicClient, http, type Address } from "viem";

import { MAINNET_V3, CLAUDELANCE_CORE_V3_ABI } from "@yeheskieltame/claudelance-types";

import { celoMainnet } from "./chain";

const rpcOverride = process.env.NEXT_PUBLIC_CELO_MAINNET_RPC;

export type TreasuryRevenue = {
  cUSD: bigint;
  CELO: bigint;
  USDC: bigint;
};

/**
 * Server-side multicall reading protocol revenue per token from the v3 proxy.
 * Uses `getStatsV3(token)` — revenue is index 1 in the returned tuple.
 * totalProtocolRevenue() was a v2-only public getter; not available on v3.
 */
export async function fetchTreasuryRevenue(): Promise<TreasuryRevenue> {
  const client = createPublicClient({
    chain: celoMainnet,
    transport: http(rpcOverride),
  });

  const results = await client.multicall({
    contracts: [
      makeStatsRead(MAINNET_V3.tokens.cUSD),
      makeStatsRead(MAINNET_V3.tokens.CELO),
      makeStatsRead(MAINNET_V3.tokens.USDC),
    ],
    allowFailure: true,
  });

  // getStatsV3 returns (volume, revenue, resolved, posters, workers, countByType[11])
  const extractRevenue = (i: number): bigint => {
    const r = results[i];
    if (!r || r.status === "failure") return 0n;
    return (r.result as readonly bigint[])[1] ?? 0n;
  };

  return {
    cUSD: extractRevenue(0),
    CELO: extractRevenue(1),
    USDC: extractRevenue(2),
  };
}

function makeStatsRead(token: Address) {
  return {
    address: MAINNET_V3.core,
    abi: CLAUDELANCE_CORE_V3_ABI,
    functionName: "getStatsV3" as const,
    args: [token] as const,
  };
}
