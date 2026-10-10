import type { BountyBrief, DesireInput, RouteResult } from "./types.js";

const CONSEQ = /\b(pay|purchase|buy|send money|sign|publish|delete|transfer ownership|change permissions|deploy to production)\b/i;
const EXTERNAL = /\b(call|phone|record|video|photograph|visit|interview|translate|design|audit|test on device|human|local person|field|outreach|introduce|contact)\b/i;
const SPLITTABLE = /\b(find|research|verify|compare|collect|summari[sz]e|list|review|analy[sz]e|source)\b/i;

function slugTitle(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= 72 ? cleaned : `${cleaned.slice(0, 69)}...`;
}

function buildBrief(input: DesireInput): BountyBrief {
  const requirements = [
    "Return the requested outcome, not a plan for doing it.",
    "Cite or attach evidence for factual claims and externally sourced results.",
    "Separate verified facts, assumptions, and unresolved gaps.",
    "Do not request passwords, seed phrases, private keys, or unnecessary personal data.",
    "Do not make payments, publish externally, or take irreversible actions without requester approval."
  ];
  if (input.privacy === "sanitized") requirements.push("Use only sanitized inputs; do not reconstruct private source data.");
  if (input.privacy === "sensitive") requirements.push("Sensitive source data is out of scope for public bounty execution.");

  return {
    title: slugTitle(input.desire),
    content: `Desired outcome: ${input.desire}\n\nSuccess means a decision-ready deliverable that satisfies the requirements below.`,
    requirements,
    tags: ["Agent", "Delegation", "Outcome", "Research"],
    budgetUsd: input.budgetUsd,
    minSubmissionUsd: Math.max(5, Math.min(input.budgetUsd, Math.round(input.budgetUsd * 0.5))),
    deadlineHours: input.deadlineHours
  };
}

export function routeDesire(input: DesireInput): RouteResult {
  const desire = input.desire.trim();
  if (!desire) throw new Error("desire is required");
  if (!Number.isFinite(input.budgetUsd) || input.budgetUsd <= 0) throw new Error("budgetUsd must be > 0");
  if (!Number.isFinite(input.deadlineHours) || input.deadlineHours <= 0) throw new Error("deadlineHours must be > 0");

  const reasons: string[] = [];
  const blockedActions = ["automatic payment", "credential disclosure", "irreversible external action"];

  if (input.privacy === "sensitive") {
    return { decision: "HUMAN_APPROVAL", confidence: 0.98, reasons: ["Sensitive data is not automatically routed to a public marketplace."], blockedActions };
  }

  if (CONSEQ.test(desire)) {
    return { decision: "HUMAN_APPROVAL", confidence: 0.95, reasons: ["The desired outcome includes a consequential action that requires explicit human approval."], blockedActions, brief: buildBrief(input) };
  }

  const caps = (input.localCapabilities ?? []).map((x) => x.toLowerCase());
  const words = desire.toLowerCase();
  const localMatch = caps.some((cap) => cap.length > 2 && words.includes(cap));
  const needsExternal = EXTERNAL.test(desire);
  const splittable = SPLITTABLE.test(desire);

  if (needsExternal && localMatch) {
    reasons.push("Part of the outcome matches local capabilities, but an external/human component remains.");
    return { decision: "HYBRID", confidence: 0.88, reasons, blockedActions, brief: buildBrief(input) };
  }
  if (needsExternal || !localMatch) {
    reasons.push(needsExternal ? "The outcome contains an external-world or specialist execution component." : "No supplied local capability clearly covers the desired outcome.");
    if (splittable) reasons.push("The work can be bounded into a verifiable deliverable suitable for a bounty.");
    return { decision: "DELEGATE", confidence: splittable ? 0.91 : 0.78, reasons, blockedActions, brief: buildBrief(input) };
  }

  reasons.push("The desired outcome matches a declared local capability and does not require external-world execution.");
  return { decision: "LOCAL", confidence: 0.86, reasons, blockedActions };
}
