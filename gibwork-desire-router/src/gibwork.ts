import type { BountyBrief } from "./types.js";

const EXPLORE_URL = process.env.GIBWORK_EXPLORE_URL ?? "https://api.gib.work/explore?page=1";

export interface PublicBounty {
  id?: string;
  title?: string;
  deadline?: string;
  tags?: string[];
  asset?: { price?: number };
}

export async function discoverPublic(minUsd = 0): Promise<PublicBounty[]> {
  const response = await fetch(EXPLORE_URL, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Gibwork explore failed: HTTP ${response.status}`);
  const body = (await response.json()) as { results?: PublicBounty[] } | PublicBounty[];
  const rows = Array.isArray(body) ? body : body.results ?? [];
  return rows.filter((row) => Number(row.asset?.price ?? 0) >= minUsd);
}

async function sdkClient() {
  const privateKey = process.env.GIBWORK_PRIVATE_KEY?.trim();
  if (!privateKey) throw new Error("GIBWORK_PRIVATE_KEY is required for wallet-authenticated SDK actions");
  const production = (process.env.GIBWORK_PRODUCTION ?? "true") !== "false";
  const { createGibworkClient } = await import("@gibwork/sdk/node");
  return createGibworkClient({ privateKey, production });
}

export async function discoverViaSdk(limit = 10) {
  const client = await sdkClient();
  return client.tasks.listAvailable({ page: 1, limit });
}

export function bountyPayload(brief: BountyBrief) {
  const mintAddress = process.env.GIBWORK_USDC_MINT?.trim();
  const baseUnitsAmount = Math.round(brief.budgetUsd * 1_000_000).toString();
  const minSubmission = Math.round(brief.minSubmissionUsd * 1_000_000).toString();
  return {
    title: brief.title,
    content: `${brief.content}\n\nRequirements:\n${brief.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}\n\nDeadline: ${brief.deadlineHours} hours from funding.`,
    tags: brief.tags,
    payment: mintAddress ? { mintAddress, amount: baseUnitsAmount } : undefined,
    minSubmissionAmount: minSubmission
  };
}

export async function createBounty(brief: BountyBrief, execute = false) {
  const payload = bountyPayload(brief);
  if (!execute) return { mode: "dry-run", payload };
  if (process.env.GIBWORK_ALLOW_SPEND !== "YES") {
    throw new Error("Refusing spend: set GIBWORK_ALLOW_SPEND=YES only after explicit human approval");
  }
  if (!payload.payment) throw new Error("GIBWORK_USDC_MINT is required for funded task creation");
  const client = await sdkClient();
  const result = await client.tasks.create(payload as Parameters<typeof client.tasks.create>[0]);
  return { mode: "executed", result };
}
