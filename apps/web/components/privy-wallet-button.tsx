"use client";

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";

import { WalletButtonCore } from "@/components/wallet-button-core";
import { getGithubUsername } from "@/lib/github-link";

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export default function PrivyWalletButton() {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["github", "wallet", "email"],
        appearance: { theme: "dark", accentColor: "#F9FF42" },
        embeddedWallets: { createOnLogin: "users-without-wallets" },
      }}
    >
      <PrivyWalletButtonInner />
    </PrivyProvider>
  );
}

function PrivyWalletButtonInner() {
  const { authenticated, login, logout, ready, user } = usePrivy();
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address;
  const githubUsername = getGithubUsername(user);

  return (
    <WalletButtonCore
      onPrivyConnect={() => login()}
      onPrivyDisconnect={logout}
      privyAuthenticated={authenticated}
      privyAddress={walletAddress}
      privyReady={ready}
      privyGithub={githubUsername}
    />
  );
}
