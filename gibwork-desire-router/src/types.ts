export type RouteDecision = "LOCAL" | "DELEGATE" | "HYBRID" | "HUMAN_APPROVAL";

export interface DesireInput {
  desire: string;
  budgetUsd: number;
  deadlineHours: number;
  localCapabilities?: string[];
  privacy?: "public" | "sanitized" | "sensitive";
}

export interface BountyBrief {
  title: string;
  content: string;
  requirements: string[];
  tags: string[];
  budgetUsd: number;
  minSubmissionUsd: number;
  deadlineHours: number;
}

export interface RouteResult {
  decision: RouteDecision;
  confidence: number;
  reasons: string[];
  blockedActions: string[];
  brief?: BountyBrief;
}
