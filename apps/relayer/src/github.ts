import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify a GitHub webhook signature (X-Hub-Signature-256: sha256=...).
 * Constant-time compare; returns false on any mismatch or missing header.
 */
export function verifyGithubSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  const received = Buffer.from(signatureHeader);
  const computed = Buffer.from(expected);
  if (received.length !== computed.length) return false;
  return timingSafeEqual(received, computed);
}

export type ParsedCiEvent = {
  headSha: string;
  conclusion: string | null;
  repo: string | null;
};

/**
 * Pull the head SHA + conclusion out of a `workflow_run` or `check_suite`
 * webhook payload. Returns null for any other event or a payload without a
 * head SHA (the field we match against the on-chain commitHash).
 */
export function parseCiWebhook(payload: unknown): ParsedCiEvent | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const root = payload as Record<string, unknown>;
  const run = (root.workflow_run ?? root.check_suite) as Record<string, unknown> | undefined;
  if (!run || typeof run !== 'object') return null;

  const headSha = typeof run.head_sha === 'string' ? run.head_sha : null;
  if (!headSha) return null;

  const conclusion = typeof run.conclusion === 'string' ? run.conclusion : null;
  const repository = root.repository as Record<string, unknown> | undefined;
  const repo =
    repository && typeof repository.full_name === 'string' ? repository.full_name : null;

  return { headSha, conclusion, repo };
}
