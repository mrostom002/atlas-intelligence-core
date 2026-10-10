# Gibwork Desire Router

**Hackathon concept:** turn a desired outcome into the smallest safe delegation decision an AI agent can make.

Most agent systems assume the next step is another model/tool call. Desire Router adds a different path: **if the desired outcome needs external human/agent capability, package it as a bounded Gibwork bounty instead of pretending the local agent can do it.**

It is deliberately *not* an autonomous spender. Read-only discovery and dry-run bounty preparation are available by default; funded task creation requires a local key, an explicit `--execute`, and `GIBWORK_ALLOW_SPEND=YES` after human approval.

## Why this is useful

- `Record three UGC videos in Cairo` → `DELEGATE` → bounded bounty brief.
- `analysis of this dataset` with local analysis capability → `LOCAL`.
- `Pay the contractor and publish the result` → `HUMAN_APPROVAL`.
- Sensitive inputs → never auto-routed to a public marketplace.

The output is an auditable delegation packet with budget, deadline, evidence requirements and action boundaries.

## Gibwork toolset used

- `@gibwork/sdk` for wallet-authenticated task discovery and optional funded task creation.
- Gibwork public explore surface for wallet-free read-only discovery.
- MCP server so compatible agents can call the router.
- Terminal CLI for non-web workflows.

## Install & verify

Requires Node.js 22+.

```bash
cd gibwork-desire-router
npm install
npm test
```

## CLI

```bash
npm run build
node dist/src/cli.js route "Record three UGC videos in Cairo" --budget 100 --hours 12
node dist/src/cli.js discover --min 50
node dist/src/cli.js prepare "Record three UGC videos in Cairo" --budget 100 --hours 12
```

Funded creation is intentionally gated:

```bash
GIBWORK_PRIVATE_KEY='<LOCAL_SECRET>' \
GIBWORK_USDC_MINT='<MINT>' \
GIBWORK_ALLOW_SPEND=YES \
node dist/src/cli.js create "Record three UGC videos in Cairo" --budget 100 --hours 12 --execute
```

Never put a private key or seed phrase in source control, logs, screenshots, issues or chat.

## MCP

```bash
node dist/src/mcp.js
```

Tools:

- `route_desire`
- `discover_gibwork_help`
- `prepare_gibwork_bounty`

None of the MCP tools can spend funds. The funded path is kept outside the MCP surface to minimize machine authority.

## Safety model

1. Sensitive data is never automatically routed to a public marketplace.
2. Payments, publishing, deletion, ownership or permission changes require human approval.
3. Discovery works without wallet credentials.
4. Funded creation requires explicit `create --execute`, local key material, and `GIBWORK_ALLOW_SPEND=YES`.
5. Bounty briefs require evidence and separate facts from unresolved gaps.

See `docs/SUBMISSION.md` for the hackathon checklist.

License: MIT.
