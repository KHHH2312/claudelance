/**
 * ABI for `ClaudelanceCore` — the single immutable contract behind the
 * Claudelance bounty marketplace. Declared `as const` so viem / wagmi / abitype
 * tooling can infer parameter and return types at compile time.
 *
 * Mirrors `IClaudelanceCore.sol` + the admin / view surface added in
 * `ClaudelanceCore.sol` (Ownable2Step rotation, settleStake, getStats, etc.).
 *
 * Verified on Celoscan against compiled bytecode at
 *   - mainnet 0x775d4278Ad3f5695fbab3c3313175e9D85811AB5
 *   - sepolia 0xA2cAe817311BBF725a7eAa45aD533b89396dFfd8
 */
export const CLAUDELANCE_CORE_ABI = [
  // ─── Constructor ────────────────────────────────────────────────────────
  {
    type: 'constructor',
    inputs: [
      { name: '_cUSD', type: 'address' },
      { name: '_treasury', type: 'address' },
      { name: '_ciRelayer', type: 'address' },
      { name: '_owner', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },

  // ─── Posting / claiming / submitting ────────────────────────────────────
  {
    type: 'function',
    name: 'postBounty',
    inputs: [
      { name: 'bountyType', type: 'uint8' },
      { name: 'targetRepoUrl', type: 'string' },
      { name: 'instructionUrl', type: 'string' },
      { name: 'requirementsHash', type: 'bytes32' },
      { name: 'amount', type: 'uint96' },
      { name: 'maxSlots', type: 'uint8' },
      { name: 'stake', type: 'uint96' },
      { name: 'deadline', type: 'uint64' },
      { name: 'ciRequired', type: 'bool' },
    ],
    outputs: [{ name: 'bountyId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimSlot',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitPR',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'prUrl', type: 'string' },
      { name: 'commitHash', type: 'bytes32' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'attestCI',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'worker', type: 'address' },
      { name: 'passed', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── Resolution + stake settlement (pull pattern) ───────────────────────
  {
    type: 'function',
    name: 'pickWinner',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'winner', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelExpired',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'settleStake',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'worker', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawEarnings',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── Views ──────────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'getBounty',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'poster', type: 'address' },
          { name: 'amount', type: 'uint96' },
          { name: 'winner', type: 'address' },
          { name: 'stakeRequired', type: 'uint96' },
          { name: 'deadline', type: 'uint64' },
          { name: 'maxSlots', type: 'uint8' },
          { name: 'claimedSlots', type: 'uint8' },
          { name: 'bountyType', type: 'uint8' },
          { name: 'ciRequired', type: 'bool' },
          { name: 'status', type: 'uint8' },
          { name: 'targetRepoUrl', type: 'string' },
          { name: 'instructionUrl', type: 'string' },
          { name: 'requirementsHash', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSubmission',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'worker', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'commitHash', type: 'bytes32' },
          { name: 'submittedAt', type: 'uint64' },
          { name: 'ciPassed', type: 'bool' },
          { name: 'stakeRefunded', type: 'bool' },
          { name: 'prUrl', type: 'string' },
          { name: 'metadata', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getClaimers',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEligibleSubmissions',
    inputs: [{ name: 'bountyId', type: 'uint256' }],
    outputs: [{ name: 'eligible', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStats',
    inputs: [],
    outputs: [
      { name: 'volume', type: 'uint256' },
      { name: 'revenue', type: 'uint256' },
      { name: 'resolved', type: 'uint256' },
      { name: 'posters', type: 'uint256' },
      { name: 'workers', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  { type: 'function', name: 'bountyCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalBountyVolume', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalProtocolRevenue', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalBountiesResolved', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'uniquePosterCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'uniqueWorkerCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  {
    type: 'function',
    name: 'bountyCountByType',
    inputs: [{ name: '', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'earnings',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasClaimed',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  { type: 'function', name: 'cUSD', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'treasury', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'ciRelayer', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'owner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingOwner', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'paused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  {
    type: 'function',
    name: 'pendingTreasury',
    inputs: [],
    outputs: [
      { name: 'proposed', type: 'address' },
      { name: 'effectiveAt', type: 'uint64' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingCIRelayer',
    inputs: [],
    outputs: [
      { name: 'proposed', type: 'address' },
      { name: 'effectiveAt', type: 'uint64' },
    ],
    stateMutability: 'view',
  },

  // ─── Constants (exposed via solc-generated public getters) ──────────────
  { type: 'function', name: 'PROTOCOL_FEE_BPS', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'BPS_DENOMINATOR', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_SLOTS', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
  { type: 'function', name: 'MIN_DEADLINE', inputs: [], outputs: [{ name: '', type: 'uint64' }], stateMutability: 'view' },
  { type: 'function', name: 'MAX_DEADLINE', inputs: [], outputs: [{ name: '', type: 'uint64' }], stateMutability: 'view' },
  { type: 'function', name: 'MIN_BOUNTY', inputs: [], outputs: [{ name: '', type: 'uint96' }], stateMutability: 'view' },
  { type: 'function', name: 'RESOLUTION_GRACE_PERIOD', inputs: [], outputs: [{ name: '', type: 'uint64' }], stateMutability: 'view' },
  { type: 'function', name: 'ADMIN_TIMELOCK', inputs: [], outputs: [{ name: '', type: 'uint64' }], stateMutability: 'view' },
  { type: 'function', name: 'PROPOSAL_VALIDITY_WINDOW', inputs: [], outputs: [{ name: '', type: 'uint64' }], stateMutability: 'view' },

  // ─── Admin (Ownable2Step + timelock-rotated treasury / relayer) ─────────
  { type: 'function', name: 'proposeTreasury', inputs: [{ name: 'newTreasury', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'applyTreasury', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cancelPendingTreasury', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'proposeCIRelayer', inputs: [{ name: 'newRelayer', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'applyCIRelayer', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cancelPendingCIRelayer', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferOwnership', inputs: [{ name: 'newOwner', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'acceptOwnership', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'renounceOwnership', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'pause', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'unpause', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    name: 'rescueERC20',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── Events ─────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'BountyPosted',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'poster', type: 'address', indexed: true },
      { name: 'bountyType', type: 'uint8', indexed: false },
      { name: 'amount', type: 'uint96', indexed: false },
      { name: 'maxSlots', type: 'uint8', indexed: false },
      { name: 'targetRepoUrl', type: 'string', indexed: false },
      { name: 'requirementsHash', type: 'bytes32', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SlotClaimed',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PRSubmitted',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'prUrl', type: 'string', indexed: false },
      { name: 'commitHash', type: 'bytes32', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CIAttested',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'passed', type: 'bool', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BountyResolved',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'winnerPayout', type: 'uint96', indexed: false },
      { name: 'protocolFee', type: 'uint96', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BountyCancelled',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'poster', type: 'address', indexed: true },
      { name: 'refundAmount', type: 'uint96', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'StakeRefunded',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'amount', type: 'uint96', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'StakeForfeited',
    inputs: [
      { name: 'bountyId', type: 'uint256', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'amount', type: 'uint96', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EarningsWithdrawn',
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProtocolRevenueAccrued',
    inputs: [
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'cumulative', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TreasuryProposed',
    inputs: [
      { name: 'proposed', type: 'address', indexed: true },
      { name: 'effectiveAt', type: 'uint64', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TreasuryUpdated',
    inputs: [
      { name: 'previous', type: 'address', indexed: true },
      { name: 'current', type: 'address', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TreasuryProposalCancelled',
    inputs: [{ name: 'proposed', type: 'address', indexed: true }],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CIRelayerProposed',
    inputs: [
      { name: 'proposed', type: 'address', indexed: true },
      { name: 'effectiveAt', type: 'uint64', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CIRelayerUpdated',
    inputs: [
      { name: 'previous', type: 'address', indexed: true },
      { name: 'current', type: 'address', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'CIRelayerProposalCancelled',
    inputs: [{ name: 'proposed', type: 'address', indexed: true }],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ERC20Rescued',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const;

/**
 * Type-level handle for the ABI. Useful when you want to pass the ABI as a
 * type parameter to viem helpers like `ContractFunctionParameters`.
 */
export type ClaudelanceCoreAbi = typeof CLAUDELANCE_CORE_ABI;
