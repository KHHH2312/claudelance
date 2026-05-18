"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "wagmi";

import { TransactionToast } from "@/components/transaction-toast";
import { wagmiConfig } from "@/lib/wallet/config";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  const app = (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        {children}
        <TransactionToast />
      </WagmiProvider>
    </QueryClientProvider>
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {privyAppId ? (
        <PrivyProvider
          appId={privyAppId}
          config={{
            loginMethods: ["github", "wallet", "email"],
            appearance: { theme: "dark", accentColor: "#7C5CFC" },
            embeddedWallets: { createOnLogin: "users-without-wallets" },
          }}
        >
          {app}
        </PrivyProvider>
      ) : (
        app
      )}
    </ThemeProvider>
  );
}
