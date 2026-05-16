"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

import { WalletButtonCore } from "@/components/wallet-button-core";

const hasPrivyAppId = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

export function WalletButton() {
  if (hasPrivyAppId) {
    return <PrivyWalletButton />;
  }

  return <WalletButtonCore />;
}

function PrivyWalletButton() {
  const { authenticated, login, logout, ready } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address;

  return (
    <WalletButtonCore
      onPrivyConnect={() => login()}
      onPrivyDisconnect={logout}
      privyAuthenticated={authenticated}
      privyAddress={walletAddress}
      privyReady={ready}
    />
  );
}
