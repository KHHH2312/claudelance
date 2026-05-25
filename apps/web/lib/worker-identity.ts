import "server-only";

import { createPublicClient, http, parseAbi, type Address } from "viem";
import { MAINNET } from "@yeheskieltame/claudelance-types";

import { celoMainnet } from "@/lib/chain";

const IDENTITY_REGISTRY = MAINNET.identityRegistry as Address;
const identityAbi = parseAbi(["function balanceOf(address owner) view returns (uint256)"]);

export type WorkerIdentity = {
  hasIdentity: boolean;
  registry: Address;
};

/**
 * Whether `worker` holds an ERC-8004 Identity NFT — the same `balanceOf > 0`
 * gate the Core enforces on `claimSlot` (NoAgentIdentity). This is the
 * canonical "is a registered agent" signal, so it mirrors what the contract
 * checks rather than relying on resolved-bounty history.
 */
export async function fetchWorkerIdentity(worker: Address): Promise<WorkerIdentity> {
  const client = createPublicClient({
    chain: celoMainnet,
    transport: http(process.env.NEXT_PUBLIC_CELO_MAINNET_RPC),
  });

  try {
    const balance = (await client.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityAbi,
      functionName: "balanceOf",
      args: [worker],
    })) as bigint;
    return { hasIdentity: balance > 0n, registry: IDENTITY_REGISTRY };
  } catch {
    return { hasIdentity: false, registry: IDENTITY_REGISTRY };
  }
}
