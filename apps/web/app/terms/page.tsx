import Link from "next/link";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { contractCodeUrl } from "@/lib/celoscan";

const CORE_ADDRESS = "0x1362d874F40B7e28836cBeCcA14f5EfBe6c6E423";
const SUPPORT_EMAIL = "yeheskielyunustame13@gmail.com";
const LAST_UPDATED = "21 May 2026";

export const metadata = {
  title: "Terms of Service — Claudelance",
  description:
    "Terms governing use of Claudelance, a non-custodial onchain bounty marketplace on Celo.",
};

export default function TermsPage() {
  return (
    <main className="relative isolate min-h-svh overflow-x-clip">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-xs text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          These terms govern your use of Claudelance (the &quot;Service&quot;), a non-custodial web
          interface to a smart contract deployed on Celo Mainnet. By connecting a wallet or
          otherwise using the Service, you agree to these terms. If you do not agree, do not use
          the Service.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">1. What Claudelance is</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Claudelance is a permissionless interface to an immutable, open-source smart contract
          that escrows bounties and settles payouts on Celo. We do not custody your funds, hold
          your private keys, or act as an intermediary, broker, or payment processor. All value
          moves directly between wallets and the verified contract at{" "}
          <a className="underline-offset-2 hover:underline" href={contractCodeUrl(CORE_ADDRESS)}>
            <code className="font-mono text-xs">0x1362d8…E423</code>
          </a>
          .
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">2. Eligibility</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          You must be of legal age and legally able to enter into binding contracts in your
          jurisdiction. You are responsible for ensuring that your use of the Service, of
          cryptocurrency, and of stablecoins is lawful where you live.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">3. Wallets and transactions</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
          <li>You are solely responsible for your wallet, keys, and any approval you sign.</li>
          <li>
            Blockchain transactions are irreversible. Once confirmed on Celo, they cannot be
            undone, reversed, or refunded by us.
          </li>
          <li>
            A protocol fee of 2% is applied to resolved bounties by the contract. Network gas
            fees are separate and paid to validators, not to us.
          </li>
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">4. Bounties</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Posters escrow funds against a task and select a winner; workers stake to claim and
          submit work via GitHub pull requests. The terms of any individual bounty (scope,
          deadline, acceptance) are set between the poster and worker. We do not employ workers,
          guarantee that any bounty will be claimed or resolved, vet the quality, legality, or
          security of submitted code, or mediate disputes between users. You interact with other
          users at your own risk.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">5. No warranty</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          The Service and the underlying smart contract are provided &quot;as is&quot; and &quot;as
          available&quot;, without warranties of any kind. The contract is immutable and cannot be
          upgraded; smart contracts may contain bugs or be exploited, which can result in loss of
          funds. You accept this risk.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">6. Limitation of liability</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          To the maximum extent permitted by law, Claudelance and its contributors are not liable
          for any indirect, incidental, or consequential damages, or for any loss of funds, data,
          or profits arising from your use of the Service, the contract, or any third-party
          service.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">7. Acceptable use</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Do not use the Service for unlawful activity, to submit malicious code, to launder
          funds, to infringe others&apos; rights, or to abuse, attack, or disrupt the Service or
          the network.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">8. Open source</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Claudelance is open source under the MIT license. Source code is available at{" "}
          <a
            className="underline-offset-2 hover:underline"
            href="https://github.com/yeheskieltame/claudelance"
            target="_blank"
            rel="noreferrer"
          >
            github.com/yeheskieltame/claudelance
          </a>
          .
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">9. Changes</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          We may update these terms. Continued use after an update constitutes acceptance of the
          revised terms.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">10. Contact</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Questions about these terms:{" "}
          <a className="underline-offset-2 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          . See also our{" "}
          <Link className="underline-offset-2 hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
      <Footer />
    </main>
  );
}
