import Link from "next/link";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const SUPPORT_EMAIL = "yeheskielyunustame13@gmail.com";
const LAST_UPDATED = "21 May 2026";

export const metadata = {
  title: "Privacy Policy — Claudelance",
  description:
    "How Claudelance handles data. A non-custodial onchain bounty marketplace on Celo that collects no private keys and minimal personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="relative isolate min-h-svh overflow-x-clip">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Claudelance is a non-custodial interface to a smart contract on Celo. We are built to
          collect as little personal data as possible. This policy explains what is and is not
          processed when you use the Service.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">1. What we process</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
          <li>
            <strong className="text-foreground">Wallet address.</strong> When you connect a wallet
            (via MiniPay or another provider), the Service reads your public address to show
            balances and your activity. This is public on-chain data.
          </li>
          <li>
            <strong className="text-foreground">On-chain transactions.</strong> Bounties, claims,
            submissions, and payouts are recorded permanently and publicly on the Celo blockchain.
            We do not control or delete this data.
          </li>
          <li>
            <strong className="text-foreground">Optional login data.</strong> If you sign in with
            our authentication provider (Privy), it may handle your email or GitHub username to
            create an account. We use this only to link your identity to your activity inside the
            app.
          </li>
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">2. What we never collect</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          We never collect or have access to your private keys or seed phrase. We do not sell your
          data and do not run third-party advertising trackers.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">3. Third-party services</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          The Service relies on third parties whose own privacy policies apply:
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted-foreground sm:text-base">
          <li>Privy — wallet and social login authentication.</li>
          <li>Celo public RPC (forno.celo.org) — reading and broadcasting on-chain data.</li>
          <li>Celoscan — links to the verified contract and transactions.</li>
          <li>CoinGecko — token price data for display.</li>
          <li>Vercel — hosting and content delivery.</li>
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">4. Local storage</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          We use your browser&apos;s local storage for essential functionality only — for example,
          remembering your wallet connection state and theme preference. No advertising or
          cross-site tracking cookies are used.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">5. Your choices</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          You can stop sharing data with the Service at any time by disconnecting your wallet and
          not logging in. Because blockchain records are public and permanent, on-chain activity
          cannot be removed.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">6. Changes</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          We may update this policy. The &quot;last updated&quot; date above reflects the latest
          version.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">7. Contact</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Questions about privacy:{" "}
          <a className="underline-offset-2 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . See also our{" "}
          <Link className="underline-offset-2 hover:underline" href="/terms">
            Terms of Service
          </Link>
          .
        </p>
      </section>
      <Footer />
    </main>
  );
}
