import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  CLAUDELANCE_CORE_ABI,
  chainForNetwork,
  type Bounty,
  type Submission,
} from '@yeheskieltame/claudelance-sdk';

import type { RelayerConfig } from './config.js';

/**
 * Thin viem wrapper exposing exactly the reads the keeper needs plus the
 * three relayer-relevant writes (attestCI is relayer-only; settleStake and
 * cancelExpired are permissionless). Writes throw without a wallet, so the
 * caller must gate them behind `config.dryRun`.
 */
export class ChainClient {
  readonly publicClient: PublicClient;
  readonly walletClient?: WalletClient<Transport, Chain, Account>;
  readonly core: Address;

  constructor(cfg: RelayerConfig) {
    const chain = chainForNetwork(cfg.network);
    const transport = http(cfg.rpcUrl);
    this.publicClient = createPublicClient({ chain, transport });
    this.core = cfg.deployment.core;
    if (cfg.relayerPrivateKey) {
      const account = privateKeyToAccount(cfg.relayerPrivateKey);
      this.walletClient = createWalletClient({ chain, transport, account });
    }
  }

  get relayerAddress(): Address | undefined {
    return this.walletClient?.account.address;
  }

  async bountyCount(): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'bountyCount',
    })) as bigint;
  }

  async getBounty(bountyId: bigint): Promise<Bounty> {
    return (await this.publicClient.readContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'getBounty',
      args: [bountyId],
    })) as Bounty;
  }

  async getClaimers(bountyId: bigint): Promise<readonly Address[]> {
    return (await this.publicClient.readContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'getClaimers',
      args: [bountyId],
    })) as readonly Address[];
  }

  async getSubmission(bountyId: bigint, worker: Address): Promise<Submission> {
    return (await this.publicClient.readContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'getSubmission',
      args: [bountyId, worker],
    })) as Submission;
  }

  async attestCI(bountyId: bigint, worker: Address, passed: boolean): Promise<`0x${string}`> {
    const wallet = this.requireWallet();
    return wallet.writeContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'attestCI',
      args: [bountyId, worker, passed],
      account: wallet.account,
      chain: wallet.chain,
    });
  }

  async settleStake(bountyId: bigint, worker: Address): Promise<`0x${string}`> {
    const wallet = this.requireWallet();
    return wallet.writeContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'settleStake',
      args: [bountyId, worker],
      account: wallet.account,
      chain: wallet.chain,
    });
  }

  async cancelExpired(bountyId: bigint): Promise<`0x${string}`> {
    const wallet = this.requireWallet();
    return wallet.writeContract({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      functionName: 'cancelExpired',
      args: [bountyId],
      account: wallet.account,
      chain: wallet.chain,
    });
  }

  /**
   * Find the (bountyId, worker) whose on-chain submission carries `commitHash`,
   * by scanning PRSubmitted logs. Returns the most recent match.
   */
  async findSubmissionByCommit(
    commitHash: `0x${string}`,
    fromBlock: bigint,
  ): Promise<{ bountyId: bigint; worker: Address } | null> {
    const logs = await this.publicClient.getContractEvents({
      address: this.core,
      abi: CLAUDELANCE_CORE_ABI,
      eventName: 'PRSubmitted',
      fromBlock,
      toBlock: 'latest',
    });
    const target = commitHash.toLowerCase();
    for (let i = logs.length - 1; i >= 0; i--) {
      const entry = logs[i];
      if (!entry) continue;
      const args = (entry as unknown as { args?: Record<string, unknown> }).args;
      if (!args) continue;
      const onChain = typeof args.commitHash === 'string' ? args.commitHash.toLowerCase() : null;
      if (onChain === target && typeof args.bountyId === 'bigint' && typeof args.worker === 'string') {
        return { bountyId: args.bountyId, worker: args.worker as Address };
      }
    }
    return null;
  }

  private requireWallet(): WalletClient<Transport, Chain, Account> {
    if (!this.walletClient) {
      throw new Error(
        '[relayer] no wallet client — set RELAYER_PRIVATE_KEY and DRY_RUN=false to broadcast',
      );
    }
    return this.walletClient;
  }
}
