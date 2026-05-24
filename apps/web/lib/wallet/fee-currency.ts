import type { Address } from "viem";
import { MAINNET } from "@yeheskieltame/claudelance-types";

import { isMiniPay } from "@/lib/wallet/config";

// MiniPay wallets hold no native CELO for gas. Celo fee abstraction (CIP-64)
// lets a tx pay gas in cUSD instead; viem's `celo` chain serializes this field.
// Outside MiniPay we return undefined so the wallet pays gas in native CELO.
export function miniPayFeeCurrency(): Address | undefined {
  return isMiniPay() ? (MAINNET.tokens.cUSD as Address) : undefined;
}
