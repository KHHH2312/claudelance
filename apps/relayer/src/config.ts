import { MAINNET, SEPOLIA, type Deployment } from '@yeheskieltame/claudelance-sdk';

export type NetworkKey = 'celo' | 'sepolia';

export type RelayerConfig = {
  network: NetworkKey;
  deployment: Deployment;
  rpcUrl: string | undefined;
  relayerPrivateKey: `0x${string}` | undefined;
  githubWebhookSecret: string | undefined;
  /** When true, actions are computed and logged but never broadcast. */
  dryRun: boolean;
  port: number;
  keeperIntervalMs: number;
  eventsFromBlock: bigint;
};

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

function parseNetwork(value: string | undefined): NetworkKey {
  return value === 'celo' ? 'celo' : 'sepolia';
}

/**
 * Build the relayer config from the environment. Fails fast when asked to
 * broadcast (DRY_RUN=false) without a signing key, so a misconfigured deploy
 * never silently runs without the ability to act.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): RelayerConfig {
  const network = parseNetwork(env.RELAYER_NETWORK);
  const deployment = network === 'celo' ? MAINNET : SEPOLIA;
  const dryRun = parseBool(env.DRY_RUN, true);
  const relayerPrivateKey = env.RELAYER_PRIVATE_KEY
    ? (env.RELAYER_PRIVATE_KEY as `0x${string}`)
    : undefined;

  if (!dryRun && !relayerPrivateKey) {
    throw new Error('[relayer] DRY_RUN=false requires RELAYER_PRIVATE_KEY to sign transactions');
  }

  return {
    network,
    deployment,
    rpcUrl: env.RELAYER_RPC_URL || undefined,
    relayerPrivateKey,
    githubWebhookSecret: env.GITHUB_WEBHOOK_SECRET || undefined,
    dryRun,
    port: Number(env.PORT ?? 8787),
    keeperIntervalMs: Number(env.KEEPER_INTERVAL_MS ?? 300_000),
    eventsFromBlock: BigInt(env.EVENTS_FROM_BLOCK ?? 0),
  };
}
