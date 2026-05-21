import { celo } from "viem/chains";

export const celoMainnet = celo;

export const supportedChains = [celoMainnet] as const;

export type SupportedChainId = (typeof supportedChains)[number]["id"];

export const DEFAULT_CHAIN_ID: SupportedChainId = celoMainnet.id;

export function chainById(id: number) {
  return supportedChains.find((c) => c.id === id);
}
