"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { WalletButtonCore } from "@/components/wallet-button-core";
import { isMiniPay } from "@/lib/wallet/config";

const hasPrivyAppId = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

// Privy's SDK (~750 KiB, pulls in WalletConnect) is only needed for non-MiniPay
// sign-in. Code-split it so it never lands on the initial/LCP critical path, and
// skip it entirely inside MiniPay, which connects via the injected wagmi connector.
const PrivyWalletButton = dynamic(() => import("@/components/privy-wallet-button"), {
  ssr: false,
  loading: () => <WalletButtonCore />,
});

export function WalletButton() {
  const [enablePrivy, setEnablePrivy] = React.useState(false);

  React.useEffect(() => {
    if (hasPrivyAppId && !isMiniPay(window.ethereum)) setEnablePrivy(true);
  }, []);

  return enablePrivy ? <PrivyWalletButton /> : <WalletButtonCore />;
}
