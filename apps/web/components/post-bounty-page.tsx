"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CLAUDELANCE_CORE_ABI,
  MAINNET,
  SEPOLIA,
  deploymentByChainId,
} from "@yeheskieltame/claudelance-types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  FileCode2,
  GitPullRequest,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import type { Address, Hash } from "viem";
import { keccak256, parseUnits, toBytes } from "viem";
import {
  createConfig,
  http,
  injected,
  useAccount,
  useConnect,
  useDisconnect,
  useWriteContract,
  WagmiProvider,
} from "wagmi";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useTransactionToast } from "@/components/transaction-toast";
import { celoMainnet, celoSepolia, DEFAULT_CHAIN_ID, supportedChains } from "@/lib/chain";
import { cn } from "@/lib/utils";

type TokenSymbol = "cUSD" | "CELO" | "USDC";
type TxMode = "approve" | "post";

type FormState = {
  token: TokenSymbol;
  amount: string;
  repoUrl: string;
  issueUrl: string;
  stake: string;
  maxSlots: string;
  deadline: string;
  ciRequired: boolean;
  alreadyApproved: boolean;
};

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [injected({ shimDisconnect: true })],
  ssr: true,
  transports: {
    [celoSepolia.id]: http(process.env.NEXT_PUBLIC_CELO_SEPOLIA_RPC),
    [celoMainnet.id]: http(process.env.NEXT_PUBLIC_CELO_MAINNET_RPC),
  },
});

const erc20Abi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const steps = [
  { id: 0, label: "Token", icon: Coins },
  { id: 1, label: "Links", icon: GitPullRequest },
  { id: 2, label: "Rules", icon: ShieldCheck },
  { id: 3, label: "Review", icon: ClipboardCheck },
] as const;

const tokenStepSchema = z.object({
  token: z.enum(["cUSD", "CELO", "USDC"]),
  amount: z.string().refine((value) => isPositiveDecimal(value), "Enter a reward amount greater than zero."),
});

const linksStepSchema = z.object({
  repoUrl: z
    .string()
    .url("Enter a repository URL.")
    .refine((value) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i.test(value), "Use a GitHub repository URL."),
  issueUrl: z
    .string()
    .url("Enter an issue URL.")
    .refine((value) => /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+\/?$/i.test(value), "Use a GitHub issue URL."),
});

const rulesStepSchema = z.object({
  stake: z.string().refine((value) => isPositiveDecimal(value), "Enter a stake greater than zero."),
  maxSlots: z
    .string()
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 255, "Use 1 to 255 slots."),
  deadline: z.string().refine((value) => {
    const time = Date.parse(value);
    return Number.isFinite(time) && time > Date.now();
  }, "Choose a future deadline."),
  ciRequired: z.boolean(),
});

const formSchema = tokenStepSchema.merge(linksStepSchema).merge(rulesStepSchema).extend({
  alreadyApproved: z.boolean(),
});

const initialState: FormState = {
  token: "CELO",
  amount: "1",
  repoUrl: "",
  issueUrl: "",
  stake: "0.1",
  maxSlots: "3",
  deadline: defaultDeadline(),
  ciRequired: true,
  alreadyApproved: false,
};

export function PostBountyPage() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PostBountyForm />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function PostBountyForm() {
  const deployment = deploymentByChainId(DEFAULT_CHAIN_ID) ?? SEPOLIA;
  const writeChainId = deployment.chainId as typeof celoSepolia.id | typeof celoMainnet.id;
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [step, setStep] = React.useState(0);
  const [values, setValues] = React.useState<FormState>(initialState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [txHash, setTxHash] = React.useState<Hash | null>(null);
  const [txMode, setTxMode] = React.useState<TxMode>("approve");
  const [approvalSubmitted, setApprovalSubmitted] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const token = tokenConfig(values.token, deployment);
  const parsed = React.useMemo(() => parseForm(values, deployment), [deployment, values]);
  const canPost = values.alreadyApproved || approvalSubmitted;

  useTransactionToast(txHash, {
    chainId: writeChainId,
    pendingMessage: txMode === "approve" ? "Approving bounty token" : "Posting bounty",
    confirmedMessage: txMode === "approve" ? "Token approved" : "Bounty posted",
    failedMessage: txMode === "approve" ? "Approval failed" : "Post bounty failed",
    toastId: txHash ? `b50:${txMode}:${txHash}` : undefined,
  });

  const connectInjected = () => {
    const connector = connectors[0];
    if (connector) connect({ connector });
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    if (key === "token" || key === "amount") setApprovalSubmitted(false);
  };

  const next = () => {
    const result = validateStep(step, values);
    setErrors(result.errors);
    if (result.ok) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const approveToken = async () => {
    const result = formSchema.safeParse(values);
    if (!result.success || !parsed) {
      setErrors(flattenZodErrors(result));
      return;
    }

    setActionError(null);
    setTxMode("approve");
    try {
      const hash = await writeContractAsync({
        address: token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [deployment.core, parsed.amount],
        chainId: writeChainId,
      });
      setTxHash(hash);
      setApprovalSubmitted(true);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  const postBounty = async () => {
    const result = formSchema.safeParse(values);
    if (!result.success || !parsed) {
      setErrors(flattenZodErrors(result));
      return;
    }

    setActionError(null);
    setTxMode("post");
    try {
      const hash = await writeContractAsync({
        address: deployment.core,
        abi: CLAUDELANCE_CORE_ABI,
        functionName: "postBounty",
        args: [
          token.address,
          0,
          normalizedUrl(values.repoUrl),
          normalizedUrl(values.issueUrl),
          parsed.requirementsHash,
          parsed.amount,
          Number(values.maxSlots),
          parsed.stake,
          parsed.deadlineSeconds,
          values.ciRequired,
        ],
        chainId: writeChainId,
      });
      setTxHash(hash);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Create bounty</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Post an onchain task</h1>
        </div>
        <WalletStrip
          address={address}
          chainName={deployment.chainName}
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={connectInjected}
          onDisconnect={() => disconnect()}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-lg border bg-card p-4 shadow-sm">
          <ol className="space-y-2">
            {steps.map((item) => {
              const Icon = item.icon;
              const active = step === item.id;
              const complete = step > item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={() => {
                      if (item.id <= step) setStep(item.id);
                    }}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-primary-foreground/30" : "border-border bg-background",
                      )}
                    >
                      {complete ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Icon className="h-4 w-4" aria-hidden />}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="rounded-lg border bg-card p-5 shadow-sm sm:p-6" data-step={step}>
          {step === 0 ? <TokenStep values={values} errors={errors} onChange={update} /> : null}
          {step === 1 ? <LinksStep values={values} errors={errors} onChange={update} /> : null}
          {step === 2 ? <RulesStep values={values} errors={errors} onChange={update} /> : null}
          {step === 3 ? (
            <ReviewStep
              values={values}
              deploymentName={deployment.chainName}
              tokenAddress={token.address}
              canPost={canPost}
              isConnected={isConnected}
              isWriting={isWriting}
              onApprove={approveToken}
              onPost={postBounty}
              onConnect={connectInjected}
              onToggleAlreadyApproved={(alreadyApproved) => update("alreadyApproved", alreadyApproved)}
              actionError={actionError}
            />
          ) : null}

          {step < 3 ? (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
              <Button type="button" onClick={next}>
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <div className="mt-8">
              <Button type="button" variant="outline" onClick={back}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function WalletStrip({
  address,
  chainName,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}: {
  address?: Address;
  chainName: string;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm shadow-sm">
      <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden />
      {isConnected && address ? (
        <>
          <span className="font-medium">{shortAddress(address)}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{chainName}</span>
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={onDisconnect}>
            Disconnect
          </button>
        </>
      ) : (
        <Button size="sm" onClick={onConnect} disabled={isConnecting}>
          {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wallet className="h-4 w-4" aria-hidden />}
          Connect
        </Button>
      )}
    </div>
  );
}

function TokenStep({
  values,
  errors,
  onChange,
}: {
  values: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <StepHeading title="Token and reward" description="Choose the escrow token and reward amount." />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {(["cUSD", "CELO", "USDC"] as TokenSymbol[]).map((token) => (
          <button
            key={token}
            type="button"
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              values.token === token ? "border-primary bg-primary/10" : "bg-background hover:bg-accent",
            )}
            onClick={() => onChange("token", token)}
          >
            <span className="text-sm font-semibold">{token}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{token === "USDC" ? "6 decimals" : "18 decimals"}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 max-w-sm">
        <LabelledInput
          label="Reward amount"
          inputMode="decimal"
          value={values.amount}
          error={errors.amount}
          placeholder="1"
          onChange={(value) => onChange("amount", value)}
        />
      </div>
    </div>
  );
}

function LinksStep({
  values,
  errors,
  onChange,
}: {
  values: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <StepHeading title="Repository links" description="Attach the target repository and issue instructions." />
      <div className="mt-6 grid gap-5">
        <LabelledInput
          label="Repository URL"
          value={values.repoUrl}
          error={errors.repoUrl}
          placeholder="https://github.com/owner/repo"
          onChange={(value) => onChange("repoUrl", value)}
        />
        <LabelledInput
          label="Issue URL"
          value={values.issueUrl}
          error={errors.issueUrl}
          placeholder="https://github.com/owner/repo/issues/123"
          onChange={(value) => onChange("issueUrl", value)}
        />
      </div>
    </div>
  );
}

function RulesStep({
  values,
  errors,
  onChange,
}: {
  values: FormState;
  errors: Record<string, string>;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div>
      <StepHeading title="Bounty rules" description="Set the stake, worker slots, deadline, and CI policy." />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <LabelledInput
          label="Stake"
          inputMode="decimal"
          value={values.stake}
          error={errors.stake}
          placeholder="0.1"
          onChange={(value) => onChange("stake", value)}
        />
        <LabelledInput
          label="Max slots"
          inputMode="numeric"
          value={values.maxSlots}
          error={errors.maxSlots}
          placeholder="3"
          onChange={(value) => onChange("maxSlots", value)}
        />
        <LabelledInput
          label="Deadline"
          type="datetime-local"
          value={values.deadline}
          error={errors.deadline}
          placeholder=""
          onChange={(value) => onChange("deadline", value)}
        />
        <label className="flex min-h-20 items-center gap-3 rounded-lg border bg-background px-4 py-3">
          <input
            type="checkbox"
            checked={values.ciRequired}
            onChange={(event) => onChange("ciRequired", event.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span>
            <span className="block text-sm font-medium">Require CI</span>
            <span className="text-xs text-muted-foreground">Mark the bounty as CI-gated.</span>
          </span>
        </label>
      </div>
    </div>
  );
}

function ReviewStep({
  values,
  deploymentName,
  tokenAddress,
  canPost,
  isConnected,
  isWriting,
  onApprove,
  onPost,
  onConnect,
  onToggleAlreadyApproved,
  actionError,
}: {
  values: FormState;
  deploymentName: string;
  tokenAddress: Address;
  canPost: boolean;
  isConnected: boolean;
  isWriting: boolean;
  onApprove: () => Promise<void>;
  onPost: () => Promise<void>;
  onConnect: () => void;
  onToggleAlreadyApproved: (value: boolean) => void;
  actionError: string | null;
}) {
  const rows = [
    ["Network", deploymentName],
    ["Token", values.token],
    ["Reward", `${values.amount} ${values.token}`],
    ["Stake", `${values.stake} ${values.token}`],
    ["Max slots", values.maxSlots],
    ["Deadline", formatDateTime(values.deadline)],
    ["CI", values.ciRequired ? "Required" : "Manual review"],
    ["Token contract", tokenAddress],
  ];

  return (
    <div>
      <StepHeading title="Review and confirm" description="Approve the token, then post the bounty onchain." />
      <div className="mt-6 grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 rounded-lg border bg-background px-4 py-3 sm:grid-cols-[160px_minmax(0,1fr)]">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
            <dd className="break-words text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <FileCode2 className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium">Instructions</p>
            <a className="mt-1 block break-words text-sm text-primary hover:underline" href={values.issueUrl} target="_blank" rel="noreferrer">
              {values.issueUrl || "No issue URL yet"}
            </a>
          </div>
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm">
        <input
          type="checkbox"
          checked={values.alreadyApproved}
          onChange={(event) => onToggleAlreadyApproved(event.target.checked)}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        I already approved this token for the Claudelance core contract.
      </label>

      {actionError ? (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {actionError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!isConnected ? (
          <Button type="button" onClick={onConnect}>
            <Wallet className="h-4 w-4" aria-hidden />
            Connect wallet
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={onApprove} disabled={isWriting}>
              {isWriting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />}
              Approve token
            </Button>
            <Button type="button" onClick={onPost} disabled={isWriting || !canPost}>
              {isWriting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ClipboardCheck className="h-4 w-4" aria-hidden />}
              Post bounty
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function LabelledInput({
  label,
  value,
  error,
  placeholder,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        className={cn(
          "mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2",
          error ? "border-destructive" : "border-input",
        )}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="mt-2 block text-sm text-destructive">{error}</span> : null}
    </label>
  );
}

function validateStep(step: number, values: FormState) {
  const schema = step === 0 ? tokenStepSchema : step === 1 ? linksStepSchema : rulesStepSchema;
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, errors: {} };
  return { ok: false, errors: flattenZodErrors(result) };
}

function flattenZodErrors(result: z.SafeParseReturnType<unknown, unknown>) {
  if (result.success) return {};
  return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? "form");
    acc[key] = issue.message;
    return acc;
  }, {});
}

function parseForm(values: FormState, deployment: typeof MAINNET | typeof SEPOLIA) {
  try {
    const token = tokenConfig(values.token, deployment);
    const amount = parseUnits(values.amount, token.decimals);
    const stake = parseUnits(values.stake, token.decimals);
    const deadlineSeconds = BigInt(Math.floor(Date.parse(values.deadline) / 1000));
    const requirementsHash = keccak256(
      toBytes(
        JSON.stringify({
          repoUrl: normalizedUrl(values.repoUrl),
          issueUrl: normalizedUrl(values.issueUrl),
          ciRequired: values.ciRequired,
          maxSlots: values.maxSlots,
        }),
      ),
    );

    return { amount, stake, deadlineSeconds, requirementsHash };
  } catch {
    return null;
  }
}

function tokenConfig(symbol: TokenSymbol, deployment: typeof MAINNET | typeof SEPOLIA) {
  const address = deployment.tokens[symbol] as Address;
  return {
    address,
    decimals: symbol === "USDC" ? 6 : 18,
  };
}

function isPositiveDecimal(value: string) {
  if (!/^\d+(\.\d+)?$/.test(value.trim())) return false;
  return Number(value) > 0;
}

function normalizedUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function defaultDeadline() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "Invalid deadline";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);
}

function shortAddress(address: Address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unable to submit the transaction.";
}
