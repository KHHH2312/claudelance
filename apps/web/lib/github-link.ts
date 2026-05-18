import type { User } from "@privy-io/react-auth";

const STORAGE_KEY = "claudelance-github-wallet-binding";

type Binding = {
  github: string;
  signature: string;
  signedAt: number;
};

export function getGithubUsername(user: User | null | undefined): string | null {
  if (!user) return null;
  const github = user.linkedAccounts?.find((a) => a.type === "github_oauth");
  if (github && "username" in github && typeof github.username === "string") {
    return github.username;
  }
  return null;
}

export function buildLinkMessage(githubUsername: string, walletAddress: string): string {
  return [
    "Claudelance worker identity binding",
    "",
    `GitHub: ${githubUsername}`,
    `Wallet: ${walletAddress.toLowerCase()}`,
    `Issued at: ${new Date().toISOString()}`,
  ].join("\n");
}

export function readBinding(walletAddress: string | null | undefined): Binding | null {
  if (!walletAddress || typeof window === "undefined") return null;
  const records = readAll();
  return records[walletAddress.toLowerCase()] ?? null;
}

export function persistBinding(
  githubUsername: string,
  walletAddress: string,
  signature: string,
): void {
  if (typeof window === "undefined") return;
  const records = readAll();
  records[walletAddress.toLowerCase()] = {
    github: githubUsername,
    signature,
    signedAt: Date.now(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function readAll(): Record<string, Binding> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Binding>) : {};
  } catch {
    return {};
  }
}
