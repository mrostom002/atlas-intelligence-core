#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { discoverPublic, createBounty } from "./gibwork.js";
import { routeDesire } from "./router.js";

const server = new Server({ name: "gibwork-desire-router", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [
  { name: "route_desire", description: "Classify a desired outcome as local, delegated, hybrid, or human-approval and produce a bounded Gibwork brief when delegation is justified.", inputSchema: { type: "object", properties: { desire: { type: "string" }, budgetUsd: { type: "number" }, deadlineHours: { type: "number" }, localCapabilities: { type: "array", items: { type: "string" } } }, required: ["desire"] } },
  { name: "discover_gibwork_help", description: "Read-only discovery of public Gibwork bounties at or above a minimum USD value. Never signs or spends.", inputSchema: { type: "object", properties: { minUsd: { type: "number" } } } },
  { name: "prepare_gibwork_bounty", description: "Create a dry-run Gibwork task payload from a desired outcome. This tool never signs or spends.", inputSchema: { type: "object", properties: { desire: { type: "string" }, budgetUsd: { type: "number" }, deadlineHours: { type: "number" } }, required: ["desire"] } }
] }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  try {
    if (req.params.name === "route_desire") {
      const result = routeDesire({ desire: String(args.desire ?? ""), budgetUsd: Number(args.budgetUsd ?? 100), deadlineHours: Number(args.deadlineHours ?? 24), localCapabilities: Array.isArray(args.localCapabilities) ? args.localCapabilities.map(String) : ["research", "writing", "code", "analysis"], privacy: "sanitized" });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
    if (req.params.name === "discover_gibwork_help") {
      const result = await discoverPublic(Number(args.minUsd ?? 0));
      return { content: [{ type: "text", text: JSON.stringify(result.slice(0, 20), null, 2) }] };
    }
    if (req.params.name === "prepare_gibwork_bounty") {
      const routed = routeDesire({ desire: String(args.desire ?? ""), budgetUsd: Number(args.budgetUsd ?? 100), deadlineHours: Number(args.deadlineHours ?? 24), localCapabilities: ["research", "writing", "code", "analysis"], privacy: "sanitized" });
      const result = routed.brief ? await createBounty(routed.brief, false) : { mode: "not-needed" };
      return { content: [{ type: "text", text: JSON.stringify({ routed, gibwork: result }, null, 2) }] };
    }
    return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
  } catch (error) {
    return { content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }], isError: true };
  }
});

await server.connect(new StdioServerTransport());
